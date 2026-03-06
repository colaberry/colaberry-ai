import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import sanitizeHtml from "sanitize-html";
import Layout from "../../../components/Layout";
import EnterprisePageHero from "../../../components/EnterprisePageHero";
import EnterpriseCtaBand from "../../../components/EnterpriseCtaBand";
import MCPCard from "../../../components/MCPCard";
import { fetchMCPServerBySlug, fetchRelatedMCPServers, MCPServer } from "../../../lib/cms";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../../lib/seo";

type MCPDetailProps = {
  mcp: MCPServer;
  allowPrivate: boolean;
  relatedServers: MCPServer[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<MCPDetailProps> = async ({ params }) => {
  const slug = String(params?.slug || "");
  const allowPrivate = process.env.NEXT_PUBLIC_SHOW_PRIVATE === "true";

  try {
    const mcp = await fetchMCPServerBySlug(slug);
    if (!mcp) {
      return { notFound: true, revalidate: 120 };
    }
    if (!allowPrivate && (mcp.visibility || "public").toLowerCase() === "private") {
      return { notFound: true, revalidate: 120 };
    }
    let relatedServers: MCPServer[] = [];
    try {
      const visibilityFilter = allowPrivate ? undefined : "public";
      relatedServers = await fetchRelatedMCPServers(mcp, {
        visibility: visibilityFilter,
        limit: 6,
      });
    } catch {
      relatedServers = [];
    }
    return {
      props: { mcp, allowPrivate, relatedServers },
      revalidate: 600,
    };
  } catch {
    return { notFound: true, revalidate: 120 };
  }
};

/* ---------- Helper components (must be before default export for Turbopack) ---------- */

type GitHubStatsData = {
  stars: number;
  forks: number;
  lastCommit: string | null;
};

function GitHubStats({ sourceUrl }: { sourceUrl?: string | null }) {
  const [stats, setStats] = useState<GitHubStatsData | null>(null);
  const match = sourceUrl?.match(/github\.com\/([^/]+)\/([^/]+)/);

  useEffect(() => {
    if (!match) return;
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");
    fetch(`/api/github-stats?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(cleanRepo)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, [sourceUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stats) return null;

  return (
    <>
      <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 8 .2Z" /></svg>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{stats.stars.toLocaleString()}</span>
        <span>stars</span>
      </span>
      <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878H6.75v-.878a2.25 2.25 0 1 0-1.5 0ZM8 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 1.5a3 3 0 1 0 0-6v-3h.75a2.25 2.25 0 0 0 2.25-2.25V3a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75V3a.75.75 0 0 0-1.5 0v.75A2.25 2.25 0 0 0 7.25 6H8v3a3 3 0 0 0 0 6Z" /></svg>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{stats.forks.toLocaleString()}</span>
        <span>forks</span>
      </span>
    </>
  );
}

function CodeBlock({ label, code, language }: { label: string; code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800/60">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="rounded bg-zinc-200/60 px-2 py-0.5 text-[0.625rem] font-medium text-zinc-500 dark:bg-zinc-700/60 dark:text-zinc-400">{language}</span>
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 8.5 3 3 5-6.5" /></svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="9" height="9" rx="1.5" /><path d="M5 11H3.5A1.5 1.5 0 0 1 2 9.5v-7A1.5 1.5 0 0 1 3.5 1h7A1.5 1.5 0 0 1 12 2.5V5" /></svg>
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="border-l-4 border-[#DC2626] pl-4 text-xl font-bold text-zinc-900 dark:border-red-400 dark:text-zinc-100">
      {title}
    </h2>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-[0.9375rem] leading-relaxed text-zinc-700 dark:text-zinc-300">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626] dark:bg-red-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SpecCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
      <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">{value}</div>
      {note && <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{note}</div>}
    </div>
  );
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
  });
  if (!clean.trim()) return null;
  return (
    <div
      className="text-[0.9375rem] leading-relaxed text-zinc-700 dark:text-zinc-300 [&_p]:mt-4 first:[&_p]:mt-0 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#DC2626] [&_a]:underline dark:[&_a]:text-red-400"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

function renderParagraphs(value: string): ReactNode[] {
  return value
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => <p key={index}>{line}</p>);
}

/* ---------- Main component ---------- */

export default function MCPDetail({ mcp, allowPrivate, relatedServers }: MCPDetailProps) {
  const isPrivate = (mcp.visibility || "public").toLowerCase() === "private";
  const status = mcp.status || "Unknown";
  const source = mcp.source || "internal";
  const sourceLabel =
    source === "external" ? "External" : source === "partner" ? "Partner" : "Internal";
  const sourceDisplay = mcp.sourceName
    ? `${sourceLabel} (${mcp.sourceName})`
    : source === "internal"
      ? `${sourceLabel} (Colaberry)`
      : sourceLabel;
  const metaTitle = `${mcp.name} | MCP Servers | Colaberry AI`;
  const metaDescription =
    mcp.description ||
    "MCP server profile with structured metadata for discoverability and deployment readiness.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai";
  const canonicalUrl = `${siteUrl}/aixcelerator/mcp/${mcp.slug || mcp.id}`;
  const seoMeta: SeoMeta = {
    title: metaTitle,
    description: metaDescription,
    canonical: buildCanonical(`/aixcelerator/mcp/${mcp.slug || mcp.id}`),
    ogType: "article",
    ogImage: mcp.coverImageUrl || null,
    ogImageAlt: mcp.coverImageAlt || `${mcp.name} MCP profile`,
  };
  const tagNames = (mcp.tags || []).map((tag) => tag.name || tag.slug).filter(Boolean);
  const companyNames = (mcp.companies || []).map((company) => company.name || company.slug).filter(Boolean);
  const lastUpdatedValue = mcp.lastUpdated ? new Date(mcp.lastUpdated) : null;
  const lastUpdatedLabel = lastUpdatedValue
    ? lastUpdatedValue.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  const capabilities = parseList(mcp.capabilities);
  const tools = parseList(mcp.tools);
  const authMethods = parseList(mcp.authMethods);
  const hostingOptions = parseList(mcp.hostingOptions);
  const pricingNotes = parseList(mcp.pricing);
  const keyBenefits = parseList(mcp.keyBenefits);
  const useCases = parseList(mcp.useCases);
  const limitations = parseList(mcp.limitations);
  const requirements = parseList(mcp.requirements);
  const compatibilityItems = parseList(mcp.compatibility);

  const hasAboutSection = Boolean(mcp.primaryFunction || mcp.description || mcp.longDescription || capabilities.length);
  const hasUseCases = useCases.length > 0;
  const hasHowItWorks = tools.length > 0 || Boolean(mcp.exampleWorkflow);
  const hasBenefits = keyBenefits.length > 0;
  const hasLimitations = limitations.length > 0;
  const hasInstallSection = Boolean(mcp.installCommand || mcp.configSnippet);
  const hasTechSpecs = authMethods.length > 0 || hostingOptions.length > 0 || compatibilityItems.length > 0 || pricingNotes.length > 0 || requirements.length > 0 || typeof mcp.usageCount === "number" || typeof mcp.rating === "number";
  const hasResources = Boolean(mcp.docsUrl || mcp.sourceUrl || mcp.tryItNowUrl);

  const publisherName = mcp.sourceName || (mcp.companies?.length ? mcp.companies[0].name : null);
  const isGitHub = Boolean(mcp.sourceUrl?.match(/github\.com\/([^/]+)\/([^/]+)/));

  const visibilityModeNote = allowPrivate
    ? "Private preview mode enabled for this environment."
    : "Public-only mode in this environment.";

  const keywords = [mcp.industry, mcp.category, ...tagNames, ...companyNames].filter(Boolean).join(", ");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: mcp.name,
    description: metaDescription,
    applicationCategory: "MCP Server",
    operatingSystem: "Web",
    url: canonicalUrl,
    publisher: { "@type": "Organization", name: "Colaberry AI", url: siteUrl },
    sameAs: mcp.sourceUrl ? [mcp.sourceUrl] : undefined,
    keywords: keywords || undefined,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Industry", value: mcp.industry || "General" },
      { "@type": "PropertyValue", name: "Category", value: mcp.category || "General" },
      { "@type": "PropertyValue", name: "Status", value: status },
      { "@type": "PropertyValue", name: "Visibility", value: isPrivate ? "Private" : "Public" },
      { "@type": "PropertyValue", name: "Source", value: sourceDisplay },
      { "@type": "PropertyValue", name: "Verified", value: mcp.verified ? "Yes" : "No" },
    ],
  };

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) => (
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
        <Link href="/aixcelerator" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          AIXcelerator
        </Link>
        <span>/</span>
        <Link href="/aixcelerator/mcp" className="hover:text-zinc-700 dark:hover:text-zinc-200">
          MCP Servers
        </Link>
        <span>/</span>
        <span className="text-zinc-700 dark:text-zinc-200" aria-current="page">
          {mcp.name}
        </span>
      </nav>

      {/* Hero */}
      <div className="mt-4">
        <EnterprisePageHero
          kicker="MCP profile"
          title={mcp.name}
          description={mcp.description || "Structured MCP server profile for enterprise catalog discovery."}
          chips={[
            mcp.industry || "General",
            ...(mcp.category ? [mcp.category] : []),
            ...(mcp.serverType ? [mcp.serverType] : []),
            ...(mcp.language ? [mcp.language] : []),
            ...(typeof mcp.openSource === "boolean" ? [mcp.openSource ? "Open source" : "Commercial"] : []),
            sourceDisplay,
            isPrivate ? "Private" : "Public",
          ]}
          primaryAction={
            mcp.tryItNowUrl
              ? { label: "Try it now", href: mcp.tryItNowUrl, external: true }
              : mcp.docsUrl
                ? { label: "View documentation", href: mcp.docsUrl, external: true }
                : { label: "Book a demo", href: "/request-demo" }
          }
          secondaryAction={
            mcp.sourceUrl
              ? { label: "View source", href: mcp.sourceUrl, external: true, variant: "secondary" }
              : { label: "View all MCP servers", href: "/aixcelerator/mcp", variant: "secondary" }
          }
          metrics={[
            { label: "Last updated", value: lastUpdatedLabel || "Pending", note: "Latest metadata refresh." },
            { label: "Signals", value: `${tagNames.length} tags`, note: `${companyNames.length} linked companies.` },
            {
              label: "Visibility",
              value: isPrivate ? "Private" : "Public",
              note: isPrivate ? "Restricted access listing." : `Available for catalog discovery. ${visibilityModeNote}`,
            },
          ]}
        />
      </div>

      {/* Publisher attribution bar */}
      {(publisherName || typeof mcp.usageCount === "number" || isGitHub) && (
        <div className="reveal mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 px-1">
          {publisherName && (
            <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-500 dark:text-zinc-500">By</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{publisherName}</span>
            </span>
          )}
          {typeof mcp.usageCount === "number" && (
            <span className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v10M4.5 9.5 8 13l3.5-3.5" /><path d="M2 2h12" /></svg>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{mcp.usageCount.toLocaleString()}</span>
              <span>installs</span>
            </span>
          )}
          <GitHubStats sourceUrl={mcp.sourceUrl} />
        </div>
      )}

      {/* Single-column content */}
      <div className="mt-10 space-y-14">

        {/* ── About This MCP Server ── */}
        {hasAboutSection && (
          <section className="reveal">
            <SectionHeading title="About This MCP Server" />
            <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />
            <div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-zinc-700 dark:text-zinc-300">
              {mcp.primaryFunction && <p className="font-medium text-zinc-900 dark:text-zinc-100">{mcp.primaryFunction}</p>}
              {mcp.description && !mcp.longDescription && <p>{mcp.description}</p>}
              {mcp.longDescription && renderRichText(mcp.longDescription)}
            </div>
            {capabilities.length > 0 && (
              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Capabilities</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {capabilities.map((cap) => (
                    <span key={cap} className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── What Problems It Solves ── */}
        {hasUseCases && (
          <section className="reveal">
            <SectionHeading title="What Problems It Solves" />
            <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />
            <div className="mt-6">
              <BulletList items={useCases} />
            </div>
          </section>
        )}

        {/* ── How It Works ── */}
        {hasHowItWorks && (
          <section className="reveal">
            <SectionHeading title="How It Works" />
            <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />

            {tools.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tools & Endpoints</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {tools.map((tool, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3.5 dark:border-zinc-700">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mcp.exampleWorkflow && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Example Workflow</h3>
                <div className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {renderParagraphs(mcp.exampleWorkflow)}
                </div>
              </div>
            )}

            {companyNames.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Integrations</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {companyNames.map((name) => (
                    <span key={name} className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Key Benefits ── */}
        {hasBenefits && (
          <section className="reveal">
            <SectionHeading title={`Why Use ${mcp.name}?`} />
            <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />
            <div className="mt-6">
              <BulletList items={keyBenefits} />
            </div>
            {hasLimitations && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Limitations</h3>
                <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {limitations.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Show limitations standalone if no benefits */}
        {!hasBenefits && hasLimitations && (
          <section className="reveal">
            <SectionHeading title="Known Limitations" />
            <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />
            <div className="mt-6">
              <BulletList items={limitations} />
            </div>
          </section>
        )}

        {/* ── Installation / Quick Start ── */}
        {hasInstallSection && (
          <section className="reveal">
            <SectionHeading title="Installation" />
            <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />
            <div className={`mt-6 grid gap-6 ${mcp.installCommand && mcp.configSnippet ? "lg:grid-cols-2" : ""}`}>
              {mcp.installCommand && (
                <CodeBlock label="Install" code={mcp.installCommand} language={mcp.language || "bash"} />
              )}
              {mcp.configSnippet && (
                <CodeBlock label="Configuration" code={mcp.configSnippet} language="json" />
              )}
            </div>
          </section>
        )}

        {/* ── Technical Specifications ── */}
        {hasTechSpecs && (
          <section className="reveal">
            <SectionHeading title="Technical Specifications" />
            <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SpecCard label="Status" value={status} />
              <SpecCard label="Industry" value={mcp.industry || "General"} />
              <SpecCard label="Category" value={mcp.category || "General"} />
              {mcp.serverType && <SpecCard label="Server type" value={mcp.serverType} />}
              {mcp.language && <SpecCard label="Language" value={mcp.language} />}
              {typeof mcp.openSource === "boolean" && (
                <SpecCard label="License" value={mcp.openSource ? "Open Source" : "Commercial"} />
              )}
              <SpecCard label="Verified" value={mcp.verified ? "Yes" : "Pending"} />
              {typeof mcp.usageCount === "number" && (
                <SpecCard label="Usage" value={mcp.usageCount.toLocaleString()} note="Recorded runs or deployments" />
              )}
              {typeof mcp.rating === "number" && (
                <SpecCard label="Rating" value={`${mcp.rating.toFixed(1)} / 5`} />
              )}
            </div>

            {(authMethods.length > 0 || hostingOptions.length > 0 || compatibilityItems.length > 0 || pricingNotes.length > 0) && (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {authMethods.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Auth Methods</h3>
                    <div className="mt-3"><BulletList items={authMethods} /></div>
                  </div>
                )}
                {hostingOptions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Hosting Options</h3>
                    <div className="mt-3"><BulletList items={hostingOptions} /></div>
                  </div>
                )}
                {compatibilityItems.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Compatibility</h3>
                    <div className="mt-3"><BulletList items={compatibilityItems} /></div>
                  </div>
                )}
                {pricingNotes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Pricing</h3>
                    <div className="mt-3"><BulletList items={pricingNotes} /></div>
                  </div>
                )}
              </div>
            )}

            {requirements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Requirements</h3>
                <div className="mt-3"><BulletList items={requirements} /></div>
              </div>
            )}
          </section>
        )}

        {/* ── Resources & Links ── */}
        {hasResources && (
          <section className="reveal">
            <SectionHeading title="Resources" />
            <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />
            <div className="mt-6 flex flex-wrap gap-3">
              {mcp.docsUrl && (
                <a href={mcp.docsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                  View documentation
                </a>
              )}
              {mcp.sourceUrl && (
                <a href={mcp.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  View source
                </a>
              )}
              {mcp.tryItNowUrl && (
                <a href={mcp.tryItNowUrl} target="_blank" rel="noreferrer" className="btn btn-cta">
                  Try it now
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── Tags ── */}
        {tagNames.length > 0 && (
          <section className="reveal">
            <div className="flex flex-wrap gap-2">
              {(mcp.tags || []).filter((t) => t.name || t.slug).map((tag) => (
                <Link
                  key={tag.slug || tag.name}
                  href={`/aixcelerator/mcp?tag=${encodeURIComponent(tag.slug || tag.name || "")}`}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200"
                >
                  {tag.name || tag.slug}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── CTA Band ── */}
      <div className="mt-14">
        <EnterpriseCtaBand
          kicker="Get started"
          title="Ready to integrate this MCP server?"
          description="Book a demo to see how this server fits your workflow, or explore the full catalog."
          primaryHref={mcp.tryItNowUrl || "/request-demo"}
          primaryLabel={mcp.tryItNowUrl ? "Try it now" : "Book a demo"}
          secondaryHref="/aixcelerator/mcp"
          secondaryLabel="View all MCP servers"
        />
      </div>

      {/* ── Related MCP Servers ── */}
      {relatedServers.length > 0 && (
        <section className="reveal mt-14">
          <SectionHeading title="Related MCP Servers" />
          <hr className="mt-3 border-zinc-200 dark:border-zinc-700" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServers.map((related) => (
              <div key={related.slug || String(related.id)} className="card-elevated rounded-xl">
                <MCPCard mcp={related} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Floating Book a Demo button */}
      <a
        href={mcp.tryItNowUrl || "/request-demo"}
        {...(mcp.tryItNowUrl ? { target: "_blank", rel: "noreferrer" } : {})}
        className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-[#DC2626] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 lg:flex"
      >
        {mcp.tryItNowUrl ? "Try it now" : "Book a demo"}
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
      </a>
    </Layout>
  );
}
