import type { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../components/Layout";
import Head from "next/head";
import { getIndustryCaseStudies, getIndustryDisplayName } from "../../data/caseStudies";
import Link from "next/link";
import SectionHeader from "../../components/SectionHeader";
import EnterpriseCtaBand from "../../components/EnterpriseCtaBand";

import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../lib/seo";
import { fetchAgents, fetchUseCases } from "../../lib/cms";

type IndustryPageProps = {
  industrySlug: string;
  industryName: string;
  agentCount: number;
  useCaseCount: number;
};

const INDUSTRY_SLUGS = [
  "agriculture", "energy", "oil-and-gas", "utilities", "healthcare-life-sciences",
  "biotech", "climate-tech", "manufacturing", "fintech", "supply-chain",
];

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: INDUSTRY_SLUGS.map((slug) => ({ params: { industry: slug } })),
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<IndustryPageProps> = async ({ params }) => {
  const industrySlug = typeof params?.industry === "string" ? params.industry : "";
  if (!industrySlug) return { notFound: true };
  const industryName = getIndustryDisplayName(industrySlug);
  let agentCount = 0;
  let useCaseCount = 0;
  try {
    const [agentsResult, useCasesResult] = await Promise.allSettled([
      fetchAgents("public"),
      fetchUseCases("public"),
    ]);
    const agents = agentsResult.status === "fulfilled" ? agentsResult.value : [];
    const useCases = useCasesResult.status === "fulfilled" ? useCasesResult.value : [];
    const matchSlug = (ind: string | null | undefined) => {
      const s = typeof ind === "string" ? ind.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and") : "";
      return s === industrySlug;
    };
    agentCount = agents.filter((a) => matchSlug(a.industry)).length;
    useCaseCount = useCases.filter((u) => matchSlug(u.industry)).length;
  } catch {}
  return { props: { industrySlug, industryName, agentCount, useCaseCount }, revalidate: 600 };
};

export default function Industry({ industrySlug, industryName, agentCount, useCaseCount }: IndustryPageProps) {
  const caseStudies = getIndustryCaseStudies(industrySlug);

  const seoMeta: SeoMeta = {
    title: `${industryName} AI Platform | Colaberry AI`,
    description: `${industryName} AI workspace with curated agents, MCP servers, playbooks, and case studies for enterprise teams.`,
    canonical: buildCanonical(`/industries/${industrySlug}`),
  };

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
              "@type": "WebPage",
              "name": `${industryName} AI Platform | Colaberry AI`,
              "description": `${industryName} AI workspace with curated agents, MCP servers, playbooks, and case studies for enterprise teams.`,
              "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai"}/industries/${industrySlug}`,
            }).replace(/</g, "\\u003c"),
          }}
        />
      </Head>
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="lg:col-span-7">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-2 pr-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
            Industry workspace
          </div>
          <div className="mt-5">
            <SectionHeader
              as="h1"
              size="xl"
              title={`${industryName} AI Platform`}
              description={`A workspace designed for people, LLMs, and agents — bringing together MCP servers, agent catalogs, and domain intelligence tailored for ${industryName}.`}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/request-demo"
              className="btn btn-primary"
            >
              Book a demo
            </Link>
            <Link href="/industries" className="btn btn-secondary">
              All industries
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
            <InfoCard
              title="What you get"
              body="Curated agents, MCP servers, and playbooks mapped to real workflows — ready for enterprise adoption."
            />
            <InfoCard
              title="How it’s delivered"
              body="Versioned releases with clear ownership, governance controls, and audit-ready operational metadata."
            />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="surface-panel border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Workspace summary</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Default subscriptions and recommended starting points.
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Metric label="Agents" value={agentCount > 0 ? `${agentCount}` : "Catalog"} />
              <Metric label="Use cases" value={useCaseCount > 0 ? `${useCaseCount}` : "Catalog"} />
              <Metric label="Research" value="Playbooks" />
              <Metric label="Governance" value="Policies" />
            </div>
          </div>
        </div>
      </div>

      <section className="reveal section-spacing surface-panel border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            kicker="Case studies"
            title={`Real outcomes in ${industryName}`}
            description="Challenges, solutions, and measurable outcomes drawn from Colaberry industry work."
            size="md"
          />
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {caseStudies?.items.length ? `${caseStudies.items.length} use cases` : "More coming soon"}
          </div>
        </div>

        {caseStudies?.items.length ? (
          <div className="stagger-grid mt-6 grid gap-4 sm:grid-cols-2">
            {caseStudies.items.map((item) => (
              <CaseStudyCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            We are finalizing more {industryName} case studies for this workspace.
          </div>
        )}
      </section>

      <EnterpriseCtaBand
        kicker="Industry delivery"
        title={`Move from catalog to outcome with ${industryName} AI`}
        description="Combine industry context, governed agents, and MCP integrations into repeatable playbooks that teams can deploy with confidence."
        primaryHref="/request-demo"
        primaryLabel="Book a demo"
        secondaryHref="/industries"
        secondaryLabel="All industries"
      />
    </Layout>
  );
}

function CaseStudyCard({
  item,
}: {
  item: {
    title: string;
    challenge: string[];
    solution: string[];
    outcomes: string[];
  };
}) {
  return (
    <div className="surface-panel border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</div>

      <div className="mt-4 grid gap-4">
        <Section title="Challenge" items={item.challenge} />
        <Section title="Colaberry’s solution" items={item.solution} />
        <Section title="Outcomes" items={item.outcomes} />
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{title}</div>
      <ul className="mt-2 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
        {items.map((line, idx) => (
          <li key={`${title}-${idx}`} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
            <span className="leading-relaxed">{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface-panel border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{value}</div>
    </div>
  );
}
