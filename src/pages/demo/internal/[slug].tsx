import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import Layout from "../../../components/Layout";
import SectionHeader from "../../../components/SectionHeader";
import { resolveSession } from "../../../lib/auth/session";
import { isInternalDemoViewer } from "../../../lib/auth/internalAccess";
import { internalDemos, type InternalDemoConfig } from "../../../data/internalDemos";

interface InternalDemoProps {
  demo: InternalDemoConfig;
  /** Hostname of the launch target, shown so staff can see where the link goes. */
  launchHost: string;
}

export default function InternalDemoPage({
  demo,
  launchHost,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <Head>
        <title>{`${demo.title} (internal) | Colaberry AI`}</title>
        {/* Staff-only: keep it out of search engines and AI crawlers. There is
            deliberately no canonical/OG metadata and no JSON-LD here. */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="reveal flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/demo"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            &larr; All demos
          </Link>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[#DC2626] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#DC2626] dark:border-[#F87171] dark:text-[#F87171]"
            title="Visible only to signed-in Colaberry staff"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626] dark:bg-[#F87171]" aria-hidden="true" />
            Internal · Colaberry staff only
          </span>
        </div>

        <SectionHeader
          as="h1"
          size="xl"
          kicker={demo.category}
          title={demo.title}
          description={demo.summary}
          animate={false}
        />

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={demo.launchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Launch demo
            <span aria-hidden="true">&#8599;</span>
          </a>
          {demo.architectureDocHref ? (
            <a
              href={demo.architectureDocHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            >
              UI documentation (private repo)
            </a>
          ) : null}
          {demo.lastUpdated ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              Listed {demo.lastUpdated}
            </span>
          ) : null}
        </div>

        {/* Any product/client specifics come from the server-only record via
            props — never as literals here, which would compile into this
            route's public client chunk. */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Opens <span className="font-medium text-zinc-700 dark:text-zinc-300">{launchHost}</span> in a
          new tab.{demo.launchNote ? ` ${demo.launchNote}` : ""}
        </p>
      </div>

      {demo.metrics.length > 0 ? (
        <div className="stagger-grid mt-12 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700 sm:grid-cols-2 lg:grid-cols-4">
          {demo.metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-1 bg-white p-5 dark:bg-zinc-950">
              <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {metric.value}
              </div>
              <div className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <section className="reveal mt-16">
        <SectionHeader
          as="h2"
          size="lg"
          kicker="What you can do"
          title="Core capabilities"
          description="What the dashboard does once you launch it."
          animate={false}
        />
        <div className="stagger-grid mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {demo.features.map((feature) => (
            <div
              key={feature.title}
              className="catalog-card flex flex-col gap-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-700"
            >
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {demo.techStack.length > 0 ? (
        <section className="reveal mt-16">
          <SectionHeader
            as="h2"
            size="lg"
            kicker="Under the hood"
            title="Technology stack"
            description="What the demo runs on."
            animate={false}
          />
          <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-[0.14em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Layer
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {demo.techStack.map((item) => (
                  <tr key={item.label}>
                    <th
                      scope="row"
                      className="whitespace-nowrap px-5 py-3 text-left font-medium text-zinc-900 dark:text-zinc-50"
                    >
                      {item.label}
                    </th>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </Layout>
  );
}

/**
 * Gate every request server-side, before any HTML exists.
 *
 * - Not signed in  -> send to /login and come back here afterwards.
 * - Signed in, not staff -> 404, identical to a slug that doesn't exist. No
 *   "forbidden" page, because that would confirm the demo is real.
 *
 * Never cached: the answer is per-user.
 */
export const getServerSideProps: GetServerSideProps<InternalDemoProps> = async (ctx) => {
  const slug = typeof ctx.params?.slug === "string" ? ctx.params.slug : "";

  const session = await resolveSession(ctx.req);
  if (!session) {
    const target = `/demo/internal/${encodeURIComponent(slug)}`;
    return {
      redirect: { destination: `/login?redirect=${encodeURIComponent(target)}`, permanent: false },
    };
  }
  if (!isInternalDemoViewer(session.email)) {
    return { notFound: true };
  }

  const demo = internalDemos.find((d) => d.slug === slug);
  if (!demo) {
    return { notFound: true };
  }

  ctx.res.setHeader("Cache-Control", "private, no-store");

  let launchHost = demo.launchUrl;
  try {
    launchHost = new URL(demo.launchUrl).host;
  } catch {
    // Relative or malformed URL — fall back to showing it verbatim.
  }

  return { props: { demo, launchHost } };
};
