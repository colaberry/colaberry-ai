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

  // The four below are behind their own logins and have no repo we can read,
  // so what is recorded here is limited to two things that can actually be
  // checked: what each app says about itself on its sign-in screen, and what
  // its deployment reveals (hosting, server headers, framework fingerprints in
  // the served bundles). `features` and `metrics` stay empty rather than
  // invented — the demo owners should supply what each tool actually does.
  {
    slug: "palni-osp-reviewer",
    launchNote:
      "Has its own sign-in. Accounts are restricted to @palni.com, @palnies.com, @smartbots.ai and @colaberry.com, so a Colaberry address should work.",
    title: "OSP Plan/Profile Reviewer",
    category: "Telecom · Design review",
    tagline: "Automated feedback on outside-plant telecom design PDFs.",
    summary:
      "Built with PALNIES. The app presents itself as automated feedback for telecom design PDFs: outside-plant (OSP) plan and profile drawings go in, and the reviewer returns feedback on them without an engineer reading every sheet by hand. What it checks and how it reports findings still needs to come from the demo owner — the app is behind its own sign-in.",
    launchUrl: "https://palni-491501.web.app",
    status: "live",
    metrics: [],
    features: [],
    techStack: [
      {
        label: "React single-page app",
        role: "Browser client, bundled with Vite and served as static assets",
      },
      {
        label: "Firebase Hosting",
        role: "Serves the app at palni-491501.web.app",
      },
      {
        label: "Firebase",
        role: "Backend services and the sign-in, which is restricted to partner domains including colaberry.com",
      },
    ],
  },
  {
    slug: "ulteig-transmission-extractor",
    launchNote:
      "Has its own email/password sign-in. The first load can take around 15 seconds while the container cold-starts.",
    title: "Transmission PDF Extractor",
    category: "Energy · Transmission lines",
    tagline: "Pulls structured data out of transmission-line PDFs.",
    summary:
      "Built for Ulteig, the engineering firm, around transmission-line work. It takes transmission-line PDFs — drawing sets and specifications — and pulls the content out as structured data instead of leaving engineers to transcribe it. Which fields it extracts, and how results come back out, still needs to come from the demo owner — the app is behind its own sign-in.",
    launchUrl: "https://transmission-pdf-extractor-78489655591.us-central1.run.app",
    status: "live",
    metrics: [],
    features: [],
    techStack: [
      {
        label: "Streamlit",
        role: "The whole interface — upload, run, and review extraction results in one Python app",
      },
      {
        label: "Google Cloud Run (us-central1)",
        role: "Hosting. Scales to zero, which is why the first open takes roughly 15 seconds",
      },
    ],
  },
  {
    // Listed but not launchable: Cloud Run still requires Google
    // authentication on this service, so a browser visit returns 401 for
    // everyone. Flip to "live" once it is redeployed with
    // --allow-unauthenticated, or put behind IAP with staff access.
    slug: "jeldwen-door-window-extractor",
    launchNote:
      "Not open yet — the service returns 401 to browser visitors because Cloud Run still requires Google authentication.",
    title: "Door & Window Extractor",
    category: "Manufacturing · Document AI",
    tagline: "Extracts door and window detail from construction document sets.",
    summary:
      "Built for Jeld-Wen, the door and window manufacturer. It reads construction document sets and pulls out the door and window detail, the schedules and specifications that would otherwise be picked out by hand. Not reachable yet: the Cloud Run service still requires Google authentication, so it answers 401 rather than opening, and nothing more can be confirmed about it until that changes.",
    launchUrl: "https://door-window-extractor-78489655591.us-central1.run.app",
    status: "coming-soon",
    metrics: [],
    features: [],
    techStack: [
      {
        label: "Google Cloud Run (us-central1)",
        role: "Hosting. Currently deployed with authentication required, so browser visits get a 401",
      },
    ],
  },
  {
    slug: "mep-tender-copilot",
    launchNote:
      'Has its own email/password sign-in — the screen reads "Sign in to open the demo package".',
    title: "MEP Tender Copilot",
    category: "Construction · Tendering",
    tagline: "Copilot for mechanical, electrical and plumbing tender packages.",
    summary:
      "A copilot for MEP tendering — the mechanical, electrical and plumbing scope of a construction bid, where the work is reading a tender package and pricing it. The sign-in offers to open a prepared demo package, so it is set up to be walked through rather than needing a live tender. What the copilot does with that package still needs to come from the demo owner.",
    launchUrl: "https://mep-tender-copilot-v6neh3v75q-uc.a.run.app",
    status: "live",
    metrics: [],
    features: [],
    techStack: [
      {
        label: "Next.js",
        role: "Application framework for the copilot UI, built with Turbopack",
      },
      {
        label: "Google Cloud Run (us-central1)",
        role: "Hosting, behind the app's own email/password sign-in",
      },
    ],
  },
];
