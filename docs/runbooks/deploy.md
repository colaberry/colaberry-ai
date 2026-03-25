# Deployment Runbook

## Pre-Deployment Checklist

Run all quality gates before deploying:

```bash
# 1. TypeScript type check — must have 0 errors
npx tsc --noEmit

# 2. Lint check — must have 0 errors
npm run lint

# 3. Full production build — must pass
npm run build
```

## Security Checks

```bash
# Check for .env files accidentally committed
git ls-files | grep -i '\.env'

# Check for console.log in production code
grep -rn "console.log" src/pages/ src/components/ src/lib/ --include="*.ts" --include="*.tsx" | grep -v "// debug"

# Run npm audit
npm audit
```

## Visual Verification

After deploying to dev/staging:

1. **Light mode** — Check 3+ pages for correct zinc colors, no forbidden colors
2. **Dark mode** — Toggle dark mode, verify all pages render correctly
3. **Mobile** — Test at 375px width minimum, verify responsive layout
4. **Ontology pages** — Verify SVG diagrams render with correct category counts
5. **Graph pages** — Verify ForceGraph2D loads with nodes and edges
6. **Solution Stacks** — Verify cards show item counts (not empty)

## Deployment — GCP Cloud Run (Production)

### Prerequisites
- GCP project: `colaberryaiwebsite` (confirm billing active)
- Artifact Registry repo created in `us-east1`
- Cloud Run API enabled
- Secrets stored in GCP Secret Manager

### Step 1: Create Artifact Registry (one-time)
```bash
gcloud artifacts repositories create colaberry-ai-repo \
  --repository-format=docker \
  --location=us-east1 \
  --description="Colaberry AI container images"
```

### Step 2: Build & Push Frontend Image
```bash
# Authenticate Docker to Artifact Registry
gcloud auth configure-docker us-east1-docker.pkg.dev

# Build and tag
docker build -t us-east1-docker.pkg.dev/colaberryaiwebsite/colaberry-ai-repo/colaberry-ai:latest .

# Push
docker push us-east1-docker.pkg.dev/colaberryaiwebsite/colaberry-ai-repo/colaberry-ai:latest
```

### Step 3: Deploy Frontend to Cloud Run
```bash
gcloud run deploy colaberry-ai-prod \
  --image us-east1-docker.pkg.dev/colaberryaiwebsite/colaberry-ai-repo/colaberry-ai:latest \
  --region us-east1 \
  --platform managed \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --concurrency 80 \
  --timeout 300 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "NEXT_PUBLIC_CMS_URL=CMS_URL:latest,CMS_API_TOKEN=CMS_API_TOKEN:latest,RESEND_API_KEY=RESEND_API_KEY:latest,NEWSLETTER_REPORT_API_KEY=NEWSLETTER_REPORT_API_KEY:latest,NEWSLETTER_UNSUBSCRIBE_SECRET=NEWSLETTER_UNSUBSCRIBE_SECRET:latest,RATE_LIMIT_SALT=RATE_LIMIT_SALT:latest,PODCAST_SYNC_SECRET=PODCAST_SYNC_SECRET:latest"
```

### Step 4: Deploy CMS to Cloud Run
```bash
# From colaberry-ai-cms-fork directory
docker build -t us-east1-docker.pkg.dev/colaberryaiwebsite/colaberry-ai-repo/colaberry-ai-cms:latest .

docker push us-east1-docker.pkg.dev/colaberryaiwebsite/colaberry-ai-repo/colaberry-ai-cms:latest

gcloud run deploy colaberry-ai-cms-prod \
  --image us-east1-docker.pkg.dev/colaberryaiwebsite/colaberry-ai-repo/colaberry-ai-cms:latest \
  --region us-east1 \
  --platform managed \
  --port 1337 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 2 \
  --concurrency 50 \
  --timeout 300 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,HOST=0.0.0.0,PORT=1337" \
  --set-secrets "APP_KEYS=STRAPI_APP_KEYS:latest,API_TOKEN_SALT=STRAPI_API_TOKEN_SALT:latest,ADMIN_JWT_SECRET=STRAPI_ADMIN_JWT_SECRET:latest,TRANSFER_TOKEN_SALT=STRAPI_TRANSFER_TOKEN_SALT:latest,JWT_SECRET=STRAPI_JWT_SECRET:latest,DATABASE_URL=STRAPI_DATABASE_URL:latest"
```

### Step 5: Cloudflare DNS
```
colaberry.ai → CNAME to Cloud Run frontend URL
# OR use Cloudflare Workers for custom domain mapping
```

### Step 6: Set up Cloud Build Triggers (CI/CD)
```bash
# Frontend trigger — on push to Release-1.0
gcloud builds triggers create github \
  --repo-name=colaberry-ai \
  --repo-owner=colaberry \
  --branch-pattern="Release-1.0" \
  --build-config=cloudbuild.yaml

# CMS trigger — on push to Release-1.0
gcloud builds triggers create github \
  --repo-name=colaberry-ai-cms \
  --repo-owner=colaberry \
  --branch-pattern="Release-1.0" \
  --build-config=cloudbuild.yaml
```

## Deployment — Vercel (Dev/Staging)

### Steps
1. Push to `dev` branch
2. Vercel auto-deploys from `dev` → `dev.colaberry.ai`
3. Verify deployment at dev URL

## Rollback

### Cloud Run
```bash
# List revisions
gcloud run revisions list --service colaberry-ai-prod --region us-east1

# Route traffic back to previous revision
gcloud run services update-traffic colaberry-ai-prod \
  --region us-east1 \
  --to-revisions <previous-revision>=100
```

### Git
1. `git revert HEAD` to undo last commit
2. Push to `Release-1.0` to trigger new Cloud Build
