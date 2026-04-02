# Colaberry AI

Enterprise AI platform built with Next.js 16, React 19, and Tailwind CSS 4. Deployed on GCP Cloud Run.

## Prerequisites

- Node.js 20+
- Docker (optional, for containerized development)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_CMS_URL` | — | Strapi CMS URL (e.g. `http://localhost:1337`) |
| `NEXT_PUBLIC_SITE_URL` | `https://colaberry.ai` | Public site URL for canonical links |
| `NEXT_PUBLIC_VTON_DEMO_URL` | `http://localhost:5173` | Virtual try-on demo service URL |

## Docker

```bash
# Frontend only (uses cloud CMS URL or set NEXT_PUBLIC_CMS_URL)
docker compose up frontend

# Full stack with local CMS
docker compose --profile with-cms up
```

## Branch Strategy

| Branch | Deploys to | Service |
|--------|-----------|---------|
| `Release-1.0.beta` | dev.colaberry.ai | `colaberry-ai` |
| `Release-1.0` | www.colaberry.ai | `colaberry-ai-prod` |

Pushes to these branches trigger Cloud Build automatically.

## Build & Validation

```bash
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript check
```

## Demo Pages

Interactive demos are embedded at `/demo/*`. Each demo runs as a separate Cloud Run service and is embedded via iframe.

| Route | Demo | Service |
|-------|------|---------|
| `/demo/lens` | Virtual Lens Try-On | goggles-vton-poc |

To add a new demo, create `src/pages/demo/<slug>.tsx` and add an entry to the `demos` array in `src/pages/demo/index.tsx`.

## Podcast CSV Import

Bulk import podcast episodes into Strapi from CSV.

### 1. Prepare CSV

Use `scripts/templates/podcast-import.template.csv` as the template.

### 2. Configure env

Set these values (in shell or `.env.local`):

- `NEXT_PUBLIC_CMS_URL` (or `STRAPI_URL`)
- `CMS_API_TOKEN` (or `STRAPI_TOKEN`)

### 3. Dry run

```bash
npm run import:podcasts:csv -- --file ./scripts/templates/podcast-import.template.csv --dry-run
```

### 4. Execute import

```bash
npm run import:podcasts:csv -- --file ./data/podcasts.csv
```

### Useful flags

- `--no-create-relations` skip auto-creating missing tags/companies
- `--strict` stop on first invalid row
- `--limit 20` import only first N rows

## Production Data Readiness Audit

Run a data gate check against Strapi before release:

```bash
npm run audit:data
```

Optional threshold overrides:

```bash
npm run audit:data -- --min-podcasts 200 --min-agents 40 --min-mcp 40 --min-use-cases 30 --verbose true
```

This verifies:

- published counts for podcasts, agents, MCP servers, and use cases
- podcast playability coverage (audio/embed presence)
- publish-date completeness for podcasts
- rich profile coverage on agent/MCP/use-case detail records
