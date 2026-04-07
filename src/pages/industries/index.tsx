import type { GetStaticProps } from "next";
import Layout from "../../components/Layout";
import Head from "next/head";
import PremiumMediaCard from "../../components/PremiumMediaCard";
import EnterpriseCtaBand from "../../components/EnterpriseCtaBand";
import EnterprisePageHero from "../../components/EnterprisePageHero";
import SectionHeader from "../../components/SectionHeader";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../lib/seo";
import { fetchAgents, fetchUseCases } from "../../lib/cms";

type IndustryCount = { agents: number; useCases: number };
type IndustriesProps = { industryCounts: Record<string, IndustryCount> };

export const getStaticProps: GetStaticProps<IndustriesProps> = async () => {
  const industryCounts: Record<string, IndustryCount> = {};
  try {
    const [agentsResult, useCasesResult] = await Promise.allSettled([
      fetchAgents("public"),
      fetchUseCases("public"),
    ]);
    const agents = agentsResult.status === "fulfilled" ? agentsResult.value : [];
    const useCases = useCasesResult.status === "fulfilled" ? useCasesResult.value : [];
    // Count agents per industry (agents have an "industry" or "industries" field)
    for (const agent of agents) {
      const ind = agent.industry || "";
      const slug = typeof ind === "string" ? ind.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and") : "";
      if (slug) {
        if (!industryCounts[slug]) industryCounts[slug] = { agents: 0, useCases: 0 };
        industryCounts[slug].agents++;
      }
    }
    // Count use cases per industry
    for (const uc of useCases) {
      const ind = uc.industry || "";
      const slug = typeof ind === "string" ? ind.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and") : "";
      if (slug) {
        if (!industryCounts[slug]) industryCounts[slug] = { agents: 0, useCases: 0 };
        industryCounts[slug].useCases++;
      }
    }
  } catch {}
  return { props: { industryCounts }, revalidate: 600 };
};

export default function IndustriesIndex({ industryCounts }: IndustriesProps) {
  const seoMeta: SeoMeta = {
    title: "Industries | Colaberry AI",
    description: "Industry-specific AI workspaces for agents, MCP patterns, use cases, and measurable outcomes.",
    canonical: buildCanonical("/industries"),
  };

  const iconProps = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "#DC2626", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const industries = [
    { name: "Agriculture", slug: "agriculture", icon: <svg {...iconProps}><path d="M12 22V8" /><path d="M5 12H2a10 10 0 0020 0h-3" /><path d="M8 5.2C9 4 10.5 3 12 3c1.5 0 3 1 4 2.2" /></svg> },
    { name: "Energy", slug: "energy", icon: <svg {...iconProps}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> },
    { name: "Oil & Gas", slug: "oil-and-gas", icon: <svg {...iconProps}><path d="M6 14c0 4 6 7 6 7s6-3 6-7c0-3-2-5-6-9-4 4-6 6-6 9z" /><path d="M12 21v-4" /><circle cx="12" cy="14" r="1" fill="#DC2626" stroke="none" /></svg> },
    { name: "Utilities", slug: "utilities", icon: <svg {...iconProps}><path d="M6 3v18" /><path d="M18 3v18" /><path d="M6 8h12" /><path d="M6 16h12" /><circle cx="12" cy="12" r="2" /></svg> },
    { name: "Healthcare & Life Sciences", slug: "healthcare-life-sciences", icon: <svg {...iconProps}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
    { name: "Biotech", slug: "biotech", icon: <svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M12 3v6" /><path d="M12 15v6" /><path d="M3 12h6" /><path d="M15 12h6" /><path d="M5.64 5.64l4.24 4.24" /><path d="M14.12 14.12l4.24 4.24" /><path d="M5.64 18.36l4.24-4.24" /><path d="M14.12 9.88l4.24-4.24" /></svg> },
    { name: "Climate Tech", slug: "climate-tech", icon: <svg {...iconProps}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg> },
    { name: "Manufacturing", slug: "manufacturing", icon: <svg {...iconProps}><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" /></svg> },
    { name: "Fintech", slug: "fintech", icon: <svg {...iconProps}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
    { name: "Supply Chain", slug: "supply-chain", icon: <svg {...iconProps}><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2H6" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg> },
  ];
  const industryHighlights = [
    {
      href: "/resources/case-studies",
      title: "Outcome stories",
      description: "Case studies with measurable outcomes and delivery context.",
      meta: "Outcomes",
      icon: <svg {...iconProps}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    },
    {
      href: "/aixcelerator/skills",
      title: "Workspace templates",
      description: "Repeatable industry-aligned playbooks and signal feeds.",
      meta: "Playbooks",
      icon: <svg {...iconProps}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    },
    {
      href: "/updates",
      title: "Domain signals",
      description: "Key data sources, workflows, and AI surfaces per industry.",
      meta: "Signals",
      icon: <svg {...iconProps}><path d="M5.636 18.364a9 9 0 010-12.728" /><path d="M8.464 15.536a5 5 0 010-7.072" /><circle cx="12" cy="12" r="1" fill="#DC2626" stroke="none" /></svg>,
    },
    {
      href: "/aixcelerator/agents",
      title: "Governed delivery",
      description: "Ownership, approvals, and evaluation-ready metadata.",
      meta: "Governance",
      icon: <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) => (
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Colaberry AI Industries",
              description:
                "Industry-specific AI workspaces for agents, MCP patterns, use cases, and measurable outcomes.",
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai"}/industries`,
            }).replace(/</g, "\\u003c"),
          }}
        />
      </Head>
      <EnterprisePageHero
        kicker="Industry expertise"
        title="Industries"
        description="Domain-led delivery surfaces for sector-specific agents, MCP patterns, use cases, and outcomes."
        chips={["Agriculture", "Energy", "Oil & Gas", "Healthcare", "Biotech", "Manufacturing", "Supply chain"]}
        primaryAction={{ label: "Explore agents", href: "/aixcelerator/agents" }}
        secondaryAction={{ label: "Browse case studies", href: "/resources/case-studies", variant: "secondary" }}
        metrics={[
          { label: "Industry tracks", value: `${industries.length}`, note: "Current vertical delivery surfaces." },
          { label: "Launch path", value: "Catalog → outcome", note: "From signals to deployable patterns." },
          { label: "Distribution", value: "Global", note: "Shared framework, domain-adapted execution." },
        ]}
      />

      <section className="reveal section-spacing">
        <SectionHeader
          kicker="Capabilities"
          title="What each workspace delivers"
          description="Outcome stories, workspace templates, domain signals, and governed delivery — all domain-adapted."
          size="md"
        />
        <div className="stagger-grid mt-6 grid gap-3 sm:grid-cols-2">
          {industryHighlights.map((item) => (
            <PremiumMediaCard
              key={item.title}
              href={item.href}
              title={item.title}
              description={item.description}
              meta={item.meta}
              icon={item.icon}
              size="sm"
            />
          ))}
        </div>
      </section>

      <section className="reveal section-spacing">
        <SectionHeader
          kicker="Verticals"
          title="Industry workspaces"
          description="Sector-specific delivery surfaces with curated agents, MCP servers, and domain intelligence."
          size="md"
        />
        <div className="stagger-grid mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((item) => (
          <PremiumMediaCard
            key={item.slug}
            href={`/industries/${item.slug}`}
            title={item.name}
            description={(() => {
              const counts = industryCounts[item.slug];
              if (!counts || (counts.agents === 0 && counts.useCases === 0)) return "Case studies, outcomes, and context.";
              const parts: string[] = [];
              if (counts.agents > 0) parts.push(`${counts.agents} agent${counts.agents === 1 ? "" : "s"}`);
              if (counts.useCases > 0) parts.push(`${counts.useCases} use case${counts.useCases === 1 ? "" : "s"}`);
              return parts.join(" \u00b7 ") + " in the catalog.";
            })()}
            meta="Industry"
            icon={item.icon}
            size="sm"
          />
        ))}
        </div>
      </section>

      <EnterpriseCtaBand
        kicker="Industry expansion"
        title="Move from catalog to outcome with domain-ready AI delivery"
        description="Combine industry context, governed agents, and MCP integrations into repeatable playbooks that teams can deploy with confidence."
        primaryHref="/aixcelerator/agents"
        primaryLabel="Explore agents"
        secondaryHref="/resources/case-studies"
        secondaryLabel="Browse case studies"
      />
    </Layout>
  );
}
