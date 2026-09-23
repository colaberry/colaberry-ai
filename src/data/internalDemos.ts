/**
 * Internal (staff-only) demo registry.
 *
 * SERVER-ONLY. Never import this from a component that renders on the client —
 * anything reachable from the browser bundle is public, which would defeat the
 * gate. It is imported from exactly two places, both of which run on the
 * server: `pages/api/demos/internal.ts` and the `getServerSideProps` of
 * `pages/demo/internal/[slug].tsx`.
 *
 * Public demos live in `./demos` and are bundled into `/demo` for AEO. These
 * are deliberately kept out of that file so the hub's static HTML, its
 * ItemList JSON-LD, and the client bundle contain no trace of them.
 */
import type { DemoConfig } from "./demos";

export interface InternalDemoConfig extends DemoConfig {
  /**
   * Sign-in guidance for the launch target, shown under the Launch button.
   *
   * Lives in the record rather than in the page component on purpose: a
   * component's literal strings are compiled into that route's client chunk,
   * which anyone can fetch. Anything here is serialized into the page props
   * instead, so it only ever reaches a viewer who passed the gate.
   */
  launchNote?: string;
}

/**
 * The AIXFreight bidding mockup is deployed per environment. Both sites point
 * at UAT for now because the production host (aixcelerator.ai) was returning
 * 502s; switch by setting this env var, no code change needed.
 */
const AIXFREIGHT_DEMO_URL =
  process.env.AIXFREIGHT_DEMO_URL || "https://uat.aixcelerator.ai/freight/mockup/";

export const internalDemos: InternalDemoConfig[] = [
  {
    slug: "aixfreight-bidding",
    launchNote:
      "The dashboard has its own ShipCES sign-in — use your ShipCES account, not your Colaberry login.",
    title: "AIXFreight Bidding Dashboard",
    category: "Logistics · Freight RFQ",
    tagline:
      "AI-assisted RFQ triage and bidding for trucking — extraction, rate suggestions, vehicle fit and deadline tracking in one operator workspace.",
    summary:
      "ShipCES AIXFreight is the bidding workspace Colaberry built for logistics operators who quote trucking RFQs by email. Instead of re-typing shipment details out of each message, the pipeline extracts them automatically with per-field confidence scores, suggests a rate from lane history and market conditions, recommends a vehicle with dimensional fit analysis, and puts a live countdown on every RFQ so nothing expires unquoted. This is the /mockup/ build: the same interface running on mock data, so it is safe to click through without touching production records.",
    launchUrl: AIXFREIGHT_DEMO_URL,
    status: "live",
    lastUpdated: "2026-09-23",
    architectureDocHref:
      "https://github.com/karunswaroop/ShipCES_EmailParsing/blob/main/shipces_django/docs/AIXFREIGHT_UI_DOCUMENTATION.md",
    metrics: [
      { value: "85–95%", label: "Extraction confidence" },
      { value: "5–10 min", label: "Manual entry saved per RFQ" },
      { value: "Real-time", label: "Deadline countdowns" },
      { value: "Mock data", label: "No production records" },
    ],
    features: [
      {
        title: "Automatic shipment extraction",
        description:
          "Pulls route, cargo specs, schedule and service type out of the RFQ email, with a confidence score on every field so operators know what to double-check.",
      },
      {
        title: "Extracted vs. assumed, colour-coded",
        description:
          "Values read directly from the email are marked separately from values the model inferred, so nothing implied is mistaken for something stated.",
      },
      {
        title: "AI rate suggestion",
        description:
          "Proposes a quote from lane history, market conditions and prior customer pricing — the fix for rates that used to vary by whoever happened to quote.",
      },
      {
        title: "Vehicle recommendation with fit analysis",
        description:
          "Scores vehicle options against the cargo's dimensions so a load isn't promised to a truck that can't carry it.",
      },
      {
        title: "Deadline countdown on every RFQ",
        description:
          "Colour-coded timers surface urgency across the queue, so quotes don't expire while sitting in an inbox.",
      },
      {
        title: "Lane and customer history",
        description:
          "Win/loss history for the lane and the customer sits beside the quote, giving operators the context to price with.",
      },
      {
        title: "Unified multi-source inbox",
        description:
          "Gmail, Outlook, load boards and WhatsApp RFQs arrive in one bucketed, filterable queue instead of several separate inboxes.",
      },
      {
        title: "Correction feedback loop",
        description:
          "Every AI-populated component can be corrected in place, capturing operator judgement as training signal.",
      },
    ],
    techStack: [
      {
        label: "Django + Daphne (ASGI)",
        role: "Application server; WebSocket push keeps processing status and countdowns live",
      },
      {
        label: "Multi-agent extraction pipeline",
        role: "Parses RFQ emails into structured shipment records with per-field confidence",
      },
      {
        label: "Single-page dashboard",
        role: "Bucketed queue, search and filters, compose/response panels, inline feedback",
      },
      {
        label: "Google Cloud (GKE)",
        role: "Hosts the UAT environment the demo points at",
      },
    ],
  },
];
