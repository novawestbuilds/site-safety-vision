# Site Safety Vision

AI-powered PPE compliance detection for construction sites.
Upload a site photo, get instant analysis on whether workers
are wearing required protective equipment.

## What it does

- Detects hard hats, hi-vis vests, harnesses and other PPE
- Flags non-compliance in seconds
- Returns confidence score and detailed analysis
- Stores all detections for historical tracking

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (storage + Postgres)
- Claude Vision API (Anthropic)
- Vercel

## Why this exists

Most construction safety issues get caught after the fact,
through weekly inspections or incident reports. AI vision
can flag them in real time.

Built as a portfolio project while preparing for the
AWS AI Practitioner certification.

## Roadmap

- [x] MVP with upload and detection
- [x] Result dashboard with PPE breakdown
- [ ] Bounding box overlay on detected items
- [ ] PDF compliance reports
- [ ] AWS Bedrock backend port
- [ ] Custom dataset fine-tuning

## Author

Built by Matt ([@mattnovabuilds](https://x.com/mattnovabuilds))
Perth, WA