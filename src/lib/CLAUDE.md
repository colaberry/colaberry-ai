# Lib Directory

Utility modules, all camelCase `.ts` files. Every function must be typed — no `any`.

## Key Modules

| Module | Purpose |
|--------|---------|
| `cms.ts` | CMS fetch functions, TypeScript types, per-type category count + tag helpers |
| `ontologyTypes.ts` | Shared type system: `ContentOntologyConfig`, `TaxonomyCategory`, `CrossTypeRelation`, `ContentCollection`, `SolutionStack` |
| `ontologyRegistry.ts` | Central registry mapping `ContentTypeName` → config, defines 8 cross-type relations, `CONTENT_TYPE_META` |
| `graphUtils.ts` | Generic `buildGraphData()` with callback-based classification, backward-compatible with skills |
| `catalogFormatters.ts` | Shared formatting helpers + `toSkillFamily()` |

## Security Modules

| Module | Purpose |
|--------|---------|
| `api-auth.ts` | Admin auth with timing-safe comparisons |
| `rate-limit.ts` | Shared rate limiter for API routes |

## Lead Capture Modules

| Module | Purpose |
|--------|---------|
| `demoRequestStore.ts` | Strapi `demo-request` write layer — `createDemoRequest()` + `updateDemoRequestDelivery()`. Bearer-token auth via `CMS_API_TOKEN`, per-request `AbortController` timeout, throws `CmsWriteError` on failure so the handler can degrade gracefully. Pure helpers (`buildCreatePayload`, `buildDeliveryUpdatePayload`) exported for `scripts/verify-demo-request-store.mjs`. |
| `newsletterSender.ts` | Email provider abstraction (Resend / SendGrid / console). Used by demo-request + contact + subscribe handlers. |

**Demo-request durability pattern:** `/api/demo-request` writes the lead to Strapi **before** calling `sendNewsletterEmail`, then updates the record with the delivery outcome (`emailDelivered`, `emailProvider`, `emailError`, `deliveryAttemptedAt`) after. Even if email bounces, the lead is durable in Strapi and visible in `/admin/content-manager/collection-types/api::demo-request.demo-request`.

## CMS Fetch Patterns

Per-type helpers follow naming convention:
- `fetch{ContentType}CategoryCounts()` — category aggregation
- `fetchAll{ContentType}Tags()` — tag list for filters
- `fetchCatalogCounts(visibility?)` — lightweight count-only queries across all 5 types

Example: `fetchMCPCategoryCounts()`, `fetchAllAgentTags()`

**Note:** Podcasts use `podcastStatus=published` filter instead of `visibility=public`. The `fetchCatalogCounts` function applies per-type filters accordingly.

## Graph Utilities

`buildGraphData()` is generic with callback-based classification:
- Accepts items + classifier function → returns nodes/links
- `buildGraphDataForType()` wraps it for specific content types
- Colors, convex hull, topological sort utilities included

---

See root `CLAUDE.md` for full project context.
