import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import sanitizeHtml from "sanitize-html";
import Layout from "../../../components/Layout";
import SectionHeader from "../../../components/SectionHeader";
import StickyTabBar from "../../../components/StickyTabBar";
import EnterprisePageHero from "../../../components/EnterprisePageHero";
import EnterpriseCtaBand from "../../../components/EnterpriseCtaBand";
import AgentCard from "../../../components/AgentCard";
import { Agent, fetchAgentBySlug, fetchRelatedAgents } from "../../../lib/cms";

import type { ReactNode } from "react";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../../lib/seo";

type AgentDetailProps = {
  agent: Agent;
  allowPrivate: boolean;
  relatedAgents: Agent[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<AgentDetailProps> = async ({ params }) => {
  const slug = String(params?.slug || "");
  const allowPrivate = process.env.NEXT_PUBLIC_SHOW_PRIVATE === "true";

  try {
    const agent = await fetchAgentBySlug(slug);
    if (!agent) {
      return { notFound: true, revalidate: 120 };
    }
    if (!allowPrivate && (agent.visibility || "public").toLowerCase() === "private") {
      return { notFound: true, revalidate: 120 };
    }
    let relatedAgents: Agent[] = [];
    try {
      const visibilityFilter = allowPrivate ? undefined : "public";
      relatedAgents = await fetchRelatedAgents(agent, { visibility: visibilityFilter, limit: 6 });
    } catch {
      relatedAgents = [];
    }
    return {
      props: { agent, allowPrivate, relatedAgents },
      revalidate: 600,
    };
  } catch {
    return { notFound: true, revalidate: 120 };
  }
};

export default function AgentDetail({ agent, allowPrivate, relatedAgents }: AgentDetailProps) {
  const isPrivate = (agent.visibility || "public").toLowerCase() === "private";
  const status = agent.status || "Unknown";
  const statusKey = status.toLowerCase();
  const source = agent.source || "internal";
  const sourceLabel =
    source === "external" ? "External" : source === "partner" ? "Partner" : "Internal";
  const sourceDisplay = agent.sourceName
    ? `${sourceLabel} (${agent.sourceName})`
    : source === "internal"
      ? `${sourceLabel} (Colaberry)`
      : sourceLabel;
  const metaTitle = `${agent.name} | Agents | Colaberry AI`;
  const metaDescription =
    agent.description ||
    "Agent profile with structured metadata for discoverability and deployment readiness.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai";
  const canonicalUrl = `${siteUrl}/aixcelerator/agents/${agent.slug || agent.id}`;
  const seoMeta: SeoMeta = {
    title: metaTitle,
    description: metaDescription,
    canonical: buildCanonical(`/aixcelerator/agents/${agent.slug || agent.id}`),
    ogType: "article",
    ogImage: agent.coverImageUrl || null,
    ogImageAlt: agent.coverImageAlt || `${agent.name} profile`,
  };
  const tagNames = (agent.tags || []).map((tag) => tag.name || tag.slug).filter(Boolean);
  const companyNames = (agent.companies || []).map((company) => company.name || company.slug).filter(Boolean);
  const lastUpdatedValue = agent.lastUpdated ? new Date(agent.lastUpdated) : null;
  const lastUpdatedLabel = lastUpdatedValue
    ? lastUpdatedValue.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;
  const coreTasks = parseList(agent.coreTasks);
  const outcomes = parseList(agent.outcomes);
  const inputs = parseList(agent.inputs);
  const outputs = parseList(agent.outputs);
  const tools = parseList(agent.tools);
  const executionModes = parseList(agent.executionModes);
  const orchestrationSteps = parseList(agent.orchestration);
  const securityItems = parseList(agent.securityCompliance);
  const keyBenefits = parseList(agent.keyBenefits);
  const useCases = parseList(agent.useCases);
  const limitations = parseList(agent.limitations);
  const requirements = parseList(agent.requirements);

  const hasAboutContent = Boolean(agent.whatItDoes || agent.longDescription || keyBenefits.length || useCases.length || outcomes.length || limitations.length);
  const hasWorkflow = orchestrationSteps.length > 0;
  const hasInputOutput = inputs.length > 0 || outputs.length > 0;
  const hasIntegrations = tools.length > 0 || companyNames.length > 0;

  const keywords = [agent.industry, ...tagNames, ...companyNames].filter(Boolean).join(", ");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: agent.name,
    description: metaDescription,
    applicationCategory: "AI Agent",
    applicationSubCategory: agent.industry || "Enterprise AI",
    operatingSystem: "Web",
    url: canonicalUrl,
    featureList: [...coreTasks, ...keyBenefits].filter(Boolean).join(", ") || undefined,
    publisher: {
      "@type": "Organization",
      name: "Colaberry AI",
      url: siteUrl,
    },
    sameAs: agent.sourceUrl ? [agent.sourceUrl] : undefined,
    keywords: keywords || undefined,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Industry", value: agent.industry || "General" },
      { "@type": "PropertyValue", name: "Status", value: status },
      { "@type": "PropertyValue", name: "Source", value: sourceDisplay },
      { "@type": "PropertyValue", name: "Verified", value: agent.verified ? "Yes" : "No" },
    ],
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AIXcelerator", item: `${siteUrl}/aixcelerator` },
      { "@type": "ListItem", position: 2, name: "Agents", item: `${siteUrl}/aixcelerator/agents` },
      { "@type": "ListItem", position: 3, name: agent.name, item: canonicalUrl },
    ],
  };

  /* Build dynamic tabs */
  const tabs = [
    { id: "about", label: "About the Agent" },
    ...(hasWorkflow ? [{ id: "how-it-works", label: "How It Works" }] : []),
    ...(hasInputOutput ? [{ id: "inputs-outputs", label: "Inputs & Outputs" }] : []),
    ...(hasIntegrations ? [{ id: "integrations", label: "Integrations" }] : []),
    { id: "specs", label: "Specs" },
  ];

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) => (
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      </Head>

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
        <Link href="/aixcelerator" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          AIXcelerator
        </Link>
        <span>/</span>
        <Link href="/aixcelerator/agents" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          Agents
        </Link>
        {agent.department && (
          <>
            <span>/</span>
            <span className="hover:text-zinc-700 dark:hover:text-zinc-200">
              {agent.department.name}
            </span>
          </>
        )}
        <span>/</span>
        <span className="text-zinc-700 dark:text-zinc-200" aria-current="page">
          {agent.name}
        </span>
      </nav>

      {/* Hero — clean title + description + CTA */}
      <div className="mt-4">
        <EnterprisePageHero
          kicker={agent.department?.name || agent.industry || "Agent profile"}
          title={agent.name}
          description={agent.description || "Structured agent profile for enterprise catalog discovery."}
          chips={[
            ...(agent.industry ? [agent.industry] : []),
            status.charAt(0).toUpperCase() + status.slice(1),
            sourceDisplay,
            ...(agent.verified ? ["Verified"] : []),
          ]}
          primaryAction={
            agent.sourceUrl
              ? { label: "View source", href: agent.sourceUrl, external: true }
              : { label: "Book a demo", href: "/request-demo" }
          }
          secondaryAction={{ label: "View all agents", href: "/aixcelerator/agents", variant: "secondary" }}
          metrics={[
            {
              label: "Status",
              value: status.charAt(0).toUpperCase() + status.slice(1),
              note: statusKey === "live" ? "Production-ready" : statusKey === "beta" ? "Pilot availability" : "Discovery stage",
            },
            ...(agent.department ? [{
              label: "Department",
              value: agent.department.name,
              note: agent.department.description || "Enterprise department",
            }] : []),
            {
              label: "Source",
              value: sourceDisplay,
              note: source === "internal" ? "Built by Colaberry" : "Third-party integration",
            },
          ]}
        />
      </div>

      {/* Sticky tab navigation */}
      <StickyTabBar tabs={tabs} />

      {/* Two-column layout: main content + sidebar */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">

        {/* ═══════════════ Main Content ═══════════════ */}
        <div className="grid gap-8">

          {/* ── About the Agent ── */}
          {hasAboutContent && (
            <section id="about" className="reveal scroll-mt-[128px] grid gap-6">
              <SectionHeader
                as="h2"
                size="md"
                kicker="About"
                title="About the Agent"
                description="What this agent does, the challenges it addresses, and where it delivers value."
              />

              {/* Overview prose */}
              {(agent.whatItDoes || agent.longDescription) && (
                <div className="surface-panel rounded-xl p-6">
                  {agent.whatItDoes && (
                    <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {renderParagraphs(agent.whatItDoes)}
                    </div>
                  )}
                  {agent.longDescription && !agent.whatItDoes && !looksLikeRawMarkdown(agent.longDescription) && (
                    <div className="mt-4">{renderRichText(agent.longDescription)}</div>
                  )}
                </div>
              )}

              {/* Challenges / Use Cases */}
              {useCases.length > 0 && (
                <div className="surface-panel rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Challenges This Agent Addresses
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {useCases.map((item, i) => (
                      <li key={`uc-${i}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {i + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Benefits — "Why use this agent?" */}
              {keyBenefits.length > 0 && (
                <div className="surface-panel rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Why Use This Agent?
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {keyBenefits.map((item, i) => (
                      <li key={`kb-${i}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#DC2626]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8.5l3.5 3.5L13 4.5" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Outcomes */}
              {outcomes.length > 0 && (
                <div className="surface-panel rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Expected Outcomes
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {outcomes.map((item, i) => (
                      <li key={`out-${i}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations */}
              {limitations.length > 0 && (
                <div className="surface-panel rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Known Limitations
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {limitations.map((item, i) => (
                      <li key={`lim-${i}`} className="flex gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* ── How It Works — Visual Numbered Steps ── */}
          {hasWorkflow && (
            <section id="how-it-works" className="reveal scroll-mt-[128px] grid gap-6">
              <SectionHeader
                as="h2"
                size="md"
                kicker="Workflow"
                title="How the Agent Works"
                description="Step-by-step operational flow showing how this agent processes tasks end-to-end."
              />

              {/* Example workflow overview */}
              {agent.exampleWorkflow && (
                <div className="surface-panel rounded-xl p-6">
                  <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {renderParagraphs(agent.exampleWorkflow)}
                  </div>
                </div>
              )}

              {/* Numbered steps */}
              <div className="relative grid gap-0">
                {/* Vertical connector line */}
                {orchestrationSteps.length > 1 && (
                  <div className="absolute left-[19px] top-[40px] bottom-[40px] w-px bg-zinc-200 dark:bg-zinc-700 lg:left-[23px]" aria-hidden="true" />
                )}
                {orchestrationSteps.map((step, i) => (
                  <div key={`step-${i}`} className="relative flex gap-4 pb-6 lg:gap-5">
                    {/* Step number circle */}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#DC2626] bg-white text-sm font-bold text-[#DC2626] dark:bg-zinc-950 lg:h-12 lg:w-12 lg:text-base">
                      {i + 1}
                    </div>
                    {/* Step content */}
                    <div className="surface-panel flex-1 rounded-xl p-5">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Step {i + 1}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Execution modes */}
              {executionModes.length > 0 && (
                <div className="surface-panel rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Execution Modes
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {executionModes.map((mode, i) => (
                      <span key={`em-${i}`} className="chip chip-neutral rounded-full px-3 py-1.5 text-xs font-medium">
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Security & compliance */}
              {securityItems.length > 0 && (
                <div className="surface-panel rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Security &amp; Compliance
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {securityItems.map((item, i) => (
                      <li key={`sec-${i}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 1.5l5.5 3v4c0 3.5-2.5 5.5-5.5 7-3-1.5-5.5-3.5-5.5-7v-4z" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* ── Inputs & Outputs ── */}
          {hasInputOutput && (
            <section id="inputs-outputs" className="reveal scroll-mt-[128px] grid gap-6">
              <SectionHeader
                as="h2"
                size="md"
                kicker="Data"
                title="Inputs &amp; Outputs"
                description="What data this agent consumes and the artifacts or actions it produces."
              />
              <div className={`grid gap-6 ${inputs.length > 0 && outputs.length > 0 ? "lg:grid-cols-2" : ""}`}>
                {inputs.length > 0 && (
                  <div className="surface-panel rounded-xl p-6">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10h14M12 5l5 5-5 5" />
                      </svg>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Input Data</h3>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {inputs.map((item, i) => (
                        <li key={`in-${i}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {outputs.length > 0 && (
                  <div className="surface-panel rounded-xl p-6">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-[#DC2626]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 10H3M8 5L3 10l5 5" />
                      </svg>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Deliverables</h3>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {outputs.map((item, i) => (
                        <li key={`out-${i}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Core tasks */}
              {coreTasks.length > 0 && (
                <div className="surface-panel rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Core Tasks
                  </h3>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {coreTasks.map((item, i) => (
                      <li key={`ct-${i}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* ── Integrations ── */}
          {hasIntegrations && (
            <section id="integrations" className="reveal scroll-mt-[128px] grid gap-6">
              <SectionHeader
                as="h2"
                size="md"
                kicker="Integrations"
                title="Systems Connected"
                description="Internal systems, APIs, and tools this agent integrates with."
              />
              <div className={`grid gap-6 ${tools.length > 0 && companyNames.length > 0 ? "lg:grid-cols-2" : ""}`}>
                {tools.length > 0 && (
                  <div className="surface-panel rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tools &amp; APIs</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tools.map((tool, i) => (
                        <span key={`tool-${i}`} className="chip chip-neutral rounded-full px-3 py-1.5 text-xs font-medium">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {companyNames.length > 0 && (
                  <div className="surface-panel rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Companies &amp; Platforms</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {companyNames.map((company, i) => (
                        <span key={`co-${i}`} className="chip chip-neutral rounded-full px-3 py-1.5 text-xs font-medium">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Specs ── */}
          <section id="specs" className="reveal scroll-mt-[128px] grid gap-6">
            <SectionHeader
              as="h2"
              size="md"
              kicker="Specifications"
              title="Agent Specs"
              description="Technical specifications, requirements, and deployment details."
            />

            {/* Spec grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SpecItem label="Status" value={status.charAt(0).toUpperCase() + status.slice(1)} />
              <SpecItem label="Industry" value={agent.industry || "General"} />
              <SpecItem label="Source" value={sourceDisplay} />
              {agent.department && <SpecItem label="Department" value={agent.department.name} />}
              <SpecItem label="Verified" value={agent.verified ? "Yes" : "No"} />
              <SpecItem label="Visibility" value={isPrivate ? "Private" : "Public"} />
              {lastUpdatedLabel && <SpecItem label="Last Updated" value={lastUpdatedLabel} />}
            </div>

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="surface-panel rounded-xl p-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Requirements</h3>
                <ul className="mt-4 space-y-2">
                  {requirements.map((item, i) => (
                    <li key={`req-${i}`} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {(agent.docsUrl || agent.demoUrl || agent.changelogUrl) && (
              <div className="surface-panel rounded-xl p-6">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Resources</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {agent.docsUrl && (
                    <a href={agent.docsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                      Documentation
                    </a>
                  )}
                  {agent.demoUrl && (
                    <a href={agent.demoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                      Live Demo
                    </a>
                  )}
                  {agent.changelogUrl && (
                    <a href={agent.changelogUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                      Changelog
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* ── Related Agents ── */}
          {relatedAgents.length > 0 && (
            <section className="reveal grid gap-6">
              <SectionHeader
                as="h2"
                size="md"
                kicker="Related"
                title="Related Agents"
                description="Other agents in the same department or industry."
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedAgents.map((related) => (
                  <div key={related.id} className="card-elevated">
                    <AgentCard agent={related} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ═══════════════ Sticky Sidebar ═══════════════ */}
        <aside className="hidden lg:block">
          <div className="sticky top-[120px] grid gap-4">

            {/* Quick stats panel */}
            <div className="surface-panel rounded-xl p-5">
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                Quick Stats
              </h3>
              <dl className="mt-4 grid gap-3">
                <SidebarStat
                  label="Status"
                  value={status.charAt(0).toUpperCase() + status.slice(1)}
                  indicator={statusKey === "live" ? "live" : statusKey === "beta" ? "beta" : "default"}
                />
                {agent.department && (
                  <SidebarStat label="Department" value={agent.department.name} />
                )}
                <SidebarStat label="Industry" value={agent.industry || "General"} />
                <SidebarStat label="Source" value={sourceDisplay} />
                {agent.verified && (
                  <SidebarStat label="Verified" value="Yes" indicator="live" />
                )}
              </dl>
            </div>

            {/* Usage / adoption signals */}
            {(agent.usageCount || agent.rating) && (
              <div className="surface-panel rounded-xl p-5">
                <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Adoption
                </h3>
                <dl className="mt-4 grid gap-3">
                  {agent.usageCount ? (
                    <SidebarStat label="Usage" value={agent.usageCount.toLocaleString()} />
                  ) : null}
                  {agent.rating ? (
                    <SidebarStat label="Rating" value={`${agent.rating.toFixed(1)} / 5`} />
                  ) : null}
                </dl>
              </div>
            )}

            {/* Tags */}
            {tagNames.length > 0 && (
              <div className="surface-panel rounded-xl p-5">
                <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Tags
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tagNames.map((tag) => (
                    <span key={tag} className="chip chip-neutral rounded-full px-2.5 py-1 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="surface-panel rounded-xl p-5">
              <Link
                href={agent.sourceUrl || "/request-demo"}
                className="btn btn-primary w-full justify-center"
                {...(agent.sourceUrl ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {agent.sourceUrl ? "View Source" : "Book a Demo"}
              </Link>
              <Link
                href="/aixcelerator/agents"
                className="btn btn-secondary mt-2 w-full justify-center"
              >
                Browse All Agents
              </Link>
            </div>

            {/* Last updated */}
            {lastUpdatedLabel && (
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                Updated {lastUpdatedLabel}
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom CTA band */}
      <EnterpriseCtaBand
        kicker="Enterprise AI"
        title="Ready to deploy this agent?"
        description="Schedule a walkthrough with our team to see how this agent integrates with your workflows."
        primaryHref="/request-demo"
        primaryLabel="Book a demo"
        secondaryHref="/aixcelerator/agents"
        secondaryLabel="Browse agents"
        className="mt-12"
      />
    </Layout>
  );
}

/* ─── Helper Components ─── */

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel rounded-xl p-4">
      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

function SidebarStat({
  label,
  value,
  indicator,
}: {
  label: string;
  value: string;
  indicator?: "live" | "beta" | "default";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {indicator === "live" && (
          <span className="h-2 w-2 rounded-full bg-[#DC2626]" aria-hidden="true" />
        )}
        {indicator === "beta" && (
          <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" aria-hidden="true" />
        )}
        {value}
      </dd>
    </div>
  );
}

/* ─── Utilities ─── */

function looksLikeRawMarkdown(value: string): boolean {
  return /^#\s|^##\s/m.test(value);
}

function parseList(value?: string | null): string[] {
  if (!value) return [];
  const parts = value
    .split(/\r?\n|•|\u2022/)
    .map((item) => item.replace(/^[-•\u2022]\s*/, "").trim())
    .filter(Boolean);
  if (parts.length > 1) return parts;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderRichText(value?: string | null): ReactNode {
  if (!value) return null;
  const clean = sanitizeHtml(value, {
    allowedTags: ["p", "br", "strong", "em", "b", "i", "u", "ul", "ol", "li", "a"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
  if (!clean.trim()) return null;
  return (
    <div
      className="text-sm text-zinc-700 dark:text-zinc-300 [&_p]:mt-3 first:[&_p]:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#DC2626] [&_a]:underline dark:[&_a]:text-red-400"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

function renderParagraphs(value: string): ReactNode[] {
  return value
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <p key={`p-${index}`}>{line}</p>
    ));
}
