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

  // The four below are written from their source repos (karunswaroop/palnies,
  // Ulteig-Transimission-New, doorAndWindowsPoC @ working, mep-tender-copilot)
  // and cross-checked against what each deployment actually serves. Figures
  // quoted as metrics come from those repos; nothing here is inferred from the
  // product name. Palnies states no numbers, so it carries no metrics rather
  // than invented ones.
  {
    slug: "palni-osp-reviewer",
    launchNote:
      "Has its own sign-in. Accounts are restricted to @palni.com, @palnies.com, @smartbots.ai and @colaberry.com, so a Colaberry address should work.",
    title: "OSP Plan/Profile Reviewer",
    category: "Telecom · Design review",
    tagline: "Automated feedback on outside-plant telecom design PDFs.",
    summary:
      "Palnies' OSP Plan/Profile Automated Reviewer. It reads outside-plant telecom design PDFs and returns the pass a senior reviewer would otherwise make sheet by sheet: structured validation against the review areas, a bill of materials pulled from the drawings, classification, and a detailed violation report. Scanned sheets are handled through OCR as well as native PDFs, and each job runs asynchronously with live progress rather than a blocking upload.",
    launchUrl: "https://palni-491501.web.app",
    status: "live",
    features: [
      {
        title: "Reviewer-style feedback sheets",
        description:
          "Validates the design against the review areas and writes violations up in detail, rather than returning a single pass/fail score.",
      },
      {
        title: "Bill of materials extraction",
        description:
          "Pulls the BOM out of the drawing set alongside the review, so the count comes from the same read as the feedback.",
      },
      {
        title: "Scanned sheets, not just native PDFs",
        description:
          "Text, images and tables come out via PyMuPDF and pdfplumber, with Tesseract OCR and OpenCV covering sheets that are scans.",
      },
      {
        title: "Claude does the judgement pass",
        description:
          "Extraction is deterministic; the review itself runs through Anthropic's Claude against the defined review areas.",
      },
      {
        title: "Live job pipeline",
        description:
          "Submissions process asynchronously with progress reported as the run proceeds, so long documents don't block the browser.",
      },
      {
        title: "Admin dashboard",
        description:
          "Every job, user activity, violation trends and downloadable outputs in one view for whoever is running the pilot.",
      },
      {
        title: "Accounts with an audit trail",
        description:
          "Firebase sign-in with per-user API keys, user/admin roles, and audit logging of who ran what.",
      },
    ],
    metrics: [],
    techStack: [
      {
        label: "FastAPI (Python 3.11)",
        role: "Backend API and the review pipeline",
      },
      {
        label: "React · Vite · TypeScript · Tailwind",
        role: "Browser client, served as static assets from Firebase Hosting",
      },
      {
        label: "PostgreSQL · SQLAlchemy · Alembic",
        role: "Persists jobs, reviews and activity so they survive container restarts",
      },
      {
        label: "Anthropic Claude",
        role: "The review engine behind the feedback and classification",
      },
      {
        label: "PyMuPDF · pdfplumber · Tesseract · OpenCV",
        role: "PDF parsing and OCR for scanned drawing sheets",
      },
      {
        label: "Firebase Authentication",
        role: "Sign-in, restricted to partner domains including colaberry.com",
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
      "Table extraction and visualisation for transmission-line technical drawings, built for Ulteig. It reads the drawing packages page by page, pulls every table out as structured data, and computes a bill of materials from them — work that otherwise means transcribing hardware counts off dozens of sheets by hand. Results come back as CSV for spreadsheets and JSON for anything downstream, with a browser viewer for working through what was found.",
    launchUrl: "https://transmission-pdf-extractor-78489655591.us-central1.run.app",
    status: "live",
    features: [
      {
        title: "Table extraction from technical drawings",
        description:
          "Pulls the tabular content out of transmission-line PDFs, including the dense multi-column tables these drawing sets carry.",
      },
      {
        title: "Bill of materials calculation",
        description:
          "Builds a BOM from the extracted tables, tracking the distinct hardware components across a package.",
      },
      {
        title: "CSV and JSON output",
        description:
          "CSV for spreadsheet analysis and JSON for programmatic use, so the extraction feeds either a person or a downstream system.",
      },
      {
        title: "Interactive viewer",
        description:
          "A browser interface for browsing and managing what was extracted, rather than handing back a file and hoping it is right.",
      },
      {
        title: "Multiple drawing packages",
        description:
          "Handles several packages (EX1, EX2, EX3) side by side, each with its own extraction and BOM.",
      },
    ],
    metrics: [
      { value: "200+", label: "Pages processed" },
      { value: "100+", label: "Tables extracted" },
      { value: "40+", label: "Hardware items tracked" },
      { value: "3", label: "Drawing packages" },
    ],
    techStack: [
      {
        label: "Streamlit (Python)",
        role: "The whole interface — run the extraction and browse results in one app",
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
      "A window and door schedule extractor for architectural PDF drawings, built for Jeld-Wen. Beyond reading the schedule out of a drawing, it fills in what the drawing leaves implied: it finds the \"EQ\" (equal) markings that stand in for real dimensions, works out the boundaries they refer to, and writes the actual figures back onto the sheet as dimension arrows. It also identifies window types from the hardware terminology and symbols used, and annotates sill heights. Output is an annotated PDF, not just a table.",
    launchUrl: "https://door-window-extractor-78489655591.us-central1.run.app",
    status: "coming-soon",
    features: [
      {
        title: "EQ dimensions resolved and drawn in",
        description:
          'Finds every "EQ" marking, detects the door or window boundary it applies to, computes the real dimension (3\'-0" from a 6\'-0" total) and draws it back onto the PDF with proper arrows — including grouping the pair on double doors.',
      },
      {
        title: "Window type detection",
        description:
          "Identifies the window type from the hardware terminology and symbols on the drawing, then labels it in place rather than leaving the reader to infer it.",
      },
      {
        title: "Sill height annotation",
        description:
          "Annotates sill heights (above finished floor) alongside the schedule data.",
      },
      {
        title: "Multi-agent extraction pipeline",
        description:
          "Separate agents read the PDF, extract the schedule tables, normalise them into a standard shape, and write the annotated output — each step inspectable on its own.",
      },
      {
        title: "Annotated PDF as the deliverable",
        description:
          "The result is the original drawing with the findings written onto it, so it can go straight back into a review rather than being cross-referenced against a spreadsheet.",
      },
    ],
    metrics: [
      { value: "62/62", label: "Unit tests passing" },
      { value: "~0.27s", label: "EQ dimension pass" },
      { value: "~2s", label: "Window type detection" },
      { value: "401", label: "Blocked — needs opening up" },
    ],
    techStack: [
      {
        label: "LangGraph · LangChain",
        role: "Orchestrates the reader, table-extractor, formatter and annotator agents",
      },
      {
        label: "Flask (Python)",
        role: "Web app with live status while a drawing is processed",
      },
      {
        label: "pdfplumber · PyMuPDF · camelot · tabula",
        role: "Table and geometry extraction from architectural PDFs; reportlab writes the annotations",
      },
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
      "Reads an MEP tender package end to end and turns what it finds wrong into cited questions for an engineer. Tendering the mechanical, electrical and plumbing scope means reconciling drawings, BOQs, specifications and schedules that rarely agree; the copilot does that reading and reports each discrepancy with the evidence behind it. It runs on one real, anonymized package — a 32-floor residential tower — so it can be walked through without a live tender. Its stance throughout is that a finding is a question, never an instruction: review actions are an append-only trail, and \"not found in this package\" is treated as a valid answer rather than a gap to fill with a guess.",
    launchUrl: "https://mep-tender-copilot-v6neh3v75q-uc.a.run.app",
    status: "live",
    features: [
      {
        title: "Cross-document contradiction check",
        description:
          "Surfaces where the package disagrees with itself — a DG rating stated several ways, a fire BOQ that stops at floor 26 of 32, template text left standing from another job.",
      },
      {
        title: "BOQ audit with withdrawn flags",
        description:
          "Normalises roughly 2,000 BOQ lines and raises flags — then shows the flags it withdrew and why, so the reviewer sees the reasoning rather than a filtered list. Queries export as CSV for the consultant.",
      },
      {
        title: "Takeoff reconciled against the BOQ",
        description:
          "Counts and lengths taken from the DWG layers, per floor, reconciled to the BOQ, with revision-to-revision diffs and reviewer exclusions carried through.",
      },
      {
        title: "Cited spec Q&A that declines",
        description:
          "Answers specification questions with the citation attached, and says the package has no answer when it does not — rather than producing a plausible one.",
      },
      {
        title: "Consultant calculations re-performed",
        description:
          "Re-runs the consultant's own calculations and reports agrees, differs, or cannot verify — with cost drilled down to the source cell.",
      },
      {
        title: "Drawings vs BOQ by system and size",
        description:
          "Whole-building reconciliation that also states where the drawings simply do not label enough to give a per-size answer.",
      },
      {
        title: "CAD quality checks",
        description:
          "Typed-over dimensions against drawn lengths, entities hidden in the CAD, and how much of each DWG the converter actually read.",
      },
      {
        title: "Accuracy measured, not asserted",
        description:
          "Every run scores its extraction against a hand-read golden set and lists each miss, so the number comes from evidence rather than a claim.",
      },
    ],
    metrics: [
      { value: "₹21.3 Cr", label: "MEP scope in the demo package" },
      { value: "84 files", label: "36 drawings · 32 workbooks · 16 docs" },
      { value: "~2,000", label: "BOQ lines normalised" },
      { value: "32 floors", label: "Residential tower" },
    ],
    techStack: [
      {
        label: "Next.js (Turbopack)",
        role: "The copilot interface — every finding opens the evidence behind it",
      },
      {
        label: "Python API",
        role: "Ingestion and analysis pipeline over drawings, BOQs, specs and schedules",
      },
      {
        label: "libredwg (dwg2dxf)",
        role: "Converts the DWG drawings so layers, blocks and entities can be read",
      },
      {
        label: "Google Cloud Run (us-central1)",
        role: "Hosting — web and API as one origin, behind the app's own passcode gate",
      },
    ],
  },
];
