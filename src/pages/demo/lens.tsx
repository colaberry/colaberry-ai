import { useState } from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import SectionHeader from "../../components/SectionHeader";
import EnterpriseCtaBand from "../../components/EnterpriseCtaBand";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../lib/seo";

const VTON_DEMO_URL =
  process.env.NEXT_PUBLIC_VTON_DEMO_URL || "http://localhost:5173";

export default function DemoLens() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const seoMeta: SeoMeta = {
    title: "Virtual Lens Try-On Demo | Colaberry AI",
    description:
      "Try on premium eyewear virtually with AI-powered face detection, real-time 3D overlay, and personalized frame recommendations.",
    canonical: buildCanonical("/demo/lens"),
  };

  const iframeSrc = `${VTON_DEMO_URL}?embedded=true&theme=dark`;

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Virtual Lens Try-On",
              description: seoMeta.description,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai"}/demo/lens`,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
            }),
          }}
        />
      </Head>

      <div className="reveal">
        <SectionHeader
          as="h1"
          size="xl"
          kicker="Live Demo"
          title="Virtual Lens Try-On"
          description="AI-powered eyewear discovery with real-time face detection, 3D overlay, and personalized frame recommendations. Use your camera or upload a photo to get started."
        />
      </div>

      <div className="reveal mt-8">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-700">
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[#DC2626] dark:border-zinc-600 dark:border-t-[#F87171]" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Loading demo&hellip;
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center bg-zinc-50 py-24 dark:bg-zinc-900">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Demo temporarily unavailable
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Please try again later or{" "}
                  <a
                    href="/request-demo"
                    className="text-[#DC2626] underline dark:text-[#F87171]"
                  >
                    request a live walkthrough
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {!error && (
            <iframe
              src={iframeSrc}
              allow="camera; microphone"
              title="Virtual Lens Try-On Demo"
              className="w-full"
              style={{
                height: "calc(100vh - 280px)",
                minHeight: "600px",
                border: "none",
                display: loaded ? "block" : "block",
                opacity: loaded ? 1 : 0,
              }}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          )}
        </div>

        <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Camera access is required for the live try-on experience. Your camera
          feed is processed locally and never stored.
        </p>
      </div>

      <EnterpriseCtaBand
        kicker="AI demos"
        title="See more from Colaberry AI"
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
