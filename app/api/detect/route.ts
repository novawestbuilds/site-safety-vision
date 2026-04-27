import { supabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('image') as File

  if (!file) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  // 1. Upload image dans Supabase Storage
  const buffer = await file.arrayBuffer()
  const blob = new Blob([buffer], { type: file.type })
  const filename = `${Date.now()}-${file.name}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filename, blob, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // 2. Envoyer l'image à Claude Vision
  const base64 = Buffer.from(buffer).toString('base64')
  const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 }
          },
          {
            type: 'text',
            text: `Analyse cette photo de chantier. Détecte les équipements de protection individuelle (EPI).
            
            Réponds UNIQUEMENT en JSON avec ce format :
            {
              "worker_count": nombre de personnes visibles,
              "compliant": true ou false (tous les workers ont les EPI requis),
              "missing_items": ["liste", "des", "EPI", "manquants"],
              "detected_items": ["liste", "des", "EPI", "détectés"],
              "confidence_avg": score entre 0 et 1,
              "details": "observation courte en français"
            }`
          }
        ]
      }
    ]
  })

  // 3. Parser la réponse Claude
  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = rawText.replace(/```json|```/g, '').trim()
  const results = JSON.parse(clean)

  // 4. Sauvegarder dans Supabase
  const { data: detection, error: dbError } = await supabase
    .from('detections')
    .insert({
      image_path: uploadData.path,
      results,
      compliant: results.compliant,
      missing_items: results.missing_items,
      worker_count: results.worker_count,
      confidence_avg: results.confidence_avg
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, detection })
}