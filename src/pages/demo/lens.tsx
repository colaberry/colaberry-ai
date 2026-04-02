import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../../components/Layout";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../lib/seo";

const VTON_DEMO_URL =
  process.env.NEXT_PUBLIC_VTON_DEMO_URL || "http://localhost:5173";

export default function DemoLens() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const seoMeta: SeoMeta = {
    title: "Virtual Lens Try-On Demo | Colaberry AI",
    description:
      "Try on premium eyewear virtually with AI-powered face detection, real-time 3D overlay, and personalized frame recommendations.",
    canonical: buildCanonical("/demo/lens"),
  };

  const iframeSrc = `${VTON_DEMO_URL}?embedded=true&theme=${theme}`;

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

      {/* Compact title bar — keeps branding without eating viewport */}
      <div className="flex items-center justify-between pb-3 pt-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#DC2626] dark:text-[#F87171]">
            Live Demo
          </span>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 sm:text-xl">
            Virtual Lens Try-On
          </h1>
        </div>
        <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
          Camera processed locally &middot; never stored
        </p>
      </div>

      {/* Immersive iframe — fills remaining viewport */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700"
        style={{ height: "calc(100dvh - var(--site-header-height) - 72px)" }}
      >
        {!loaded && !error && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900"
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[#DC2626] dark:border-zinc-600 dark:border-t-[#F87171]"
                aria-hidden="true"
              />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Loading demo&hellip;
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
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
            aria-hidden={!loaded}
            className="h-full w-full"
            style={{
              border: "none",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </div>
    </Layout>
  );
}
