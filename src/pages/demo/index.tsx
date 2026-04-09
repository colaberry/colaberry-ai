import Head from "next/head";
import Link from "next/link";
import Layout from "../../components/Layout";
import SectionHeader from "../../components/SectionHeader";
import EnterpriseCtaBand from "../../components/EnterpriseCtaBand";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../lib/seo";

interface DemoConfig {
  slug: string;
  title: string;
  description: string;
  status: "live" | "coming-soon";
}

const demos: DemoConfig[] = [
  {
    slug: "lens",
    title: "Virtual Lens Try-On",
    description:
      "AI-powered eyewear discovery with real-time face detection, 3D overlay, and personalized frame recommendations.",
    status: "live",
  },
];

export default function DemoHub() {
  const seoMeta: SeoMeta = {
    title: "Live Demos | Colaberry AI",
    description:
      "Explore interactive AI demos built by Colaberry AI Research Labs — from virtual try-on to intelligent assistants.",
    canonical: buildCanonical("/demo"),
  };

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) =>
          "rel" in props ? (
            <link key={key} {...props} />
          ) : (
            <meta key={key} {...props} />
          )
        )}
      </Head>

      <div className="reveal">
        <SectionHeader
          as="h1"
          size="xl"
          kicker="Interactive Demos"
          title="Experience AI in action"
          description="Hands-on demos showcasing Colaberry AI Research Labs capabilities — from computer vision to intelligent assistants."
        />
      </div>

      <div className="stagger-grid mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <DemoCard key={demo.slug} demo={demo} />
        ))}
      </div>

      <EnterpriseCtaBand
        kicker="AI platform"
        title="Ready to transform your workflows?"
        description="Explore the full AIXcelerator platform — agents, skills, MCP servers, and modular capability layers."
        primaryHref="/request-demo"
        primaryLabel="Book a demo"
        secondaryHref="/aixcelerator"
        secondaryLabel="Explore AIXcelerator"
        className="mt-16"
      />
    </Layout>
  );
}

function DemoCard({ demo }: { demo: DemoConfig }) {
  const isLive = demo.status === "live";

  return isLive ? (
    <Link
      href={`/demo/${demo.slug}`}
      className="catalog-card group flex flex-col gap-4 rounded-2xl border border-zinc-200 p-6 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
    >
      <CardInner demo={demo} />
    </Link>
  ) : (
    <div className="catalog-card flex flex-col gap-4 rounded-2xl border border-zinc-200 p-6 opacity-60 dark:border-zinc-700">
      <CardInner demo={demo} />
    </div>
  );
}

function CardInner({ demo }: { demo: DemoConfig }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {demo.title}
        </h2>
        {demo.status === "live" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            Coming soon
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {demo.description}
      </p>
      {demo.status === "live" && (
        <span className="mt-auto text-sm font-medium text-[#DC2626] dark:text-[#F87171]">
          Launch demo &rarr;
        </span>
      )}
    </>
  );
}
