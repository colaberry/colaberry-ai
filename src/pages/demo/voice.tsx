import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../lib/seo";
import { readSessionToken, resolveSession } from "../../lib/auth/session";

const VOICE_AGENT_URL =
  process.env.NEXT_PUBLIC_VOICE_AGENT_URL || "http://localhost:3000";

function originOf(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "*";
  }
}
const VOICE_ORIGIN = originOf(VOICE_AGENT_URL);

interface DemoVoiceProps {
  /** The signed-in user's session JWT (from the httpOnly cookie), or null. */
  initialToken: string | null;
}

export default function DemoVoice({ initialToken }: DemoVoiceProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      const observer = new MutationObserver(onStoreChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light") as "light" | "dark",
    () => "dark" as const,
  );

  // Hand the session token down to the voice iframe (targetOrigin-scoped so it
  // is only ever delivered to the voice app's origin).
  const postToken = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win || VOICE_ORIGIN === "*") return;
    win.postMessage(
      { source: "cb-parent", type: "auth-token", token: initialToken ?? null },
      VOICE_ORIGIN,
    );
  }, [initialToken]);

  // Answer the voice app's handshake: reply to a token request, and honour a
  // "login-required" bounce by navigating the TOP window to the global login.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== VOICE_ORIGIN) return;
      const d = e.data as { source?: string; type?: string; redirect?: unknown } | null;
      if (!d || d.source !== "cb-voice") return;
      if (d.type === "auth-request") {
        postToken();
      } else if (d.type === "login-required") {
        const target =
          typeof d.redirect === "string" && d.redirect.startsWith("/") && !d.redirect.startsWith("//")
            ? d.redirect
            : "/demo/voice";
        void router.push(`/login?redirect=${encodeURIComponent(target)}`);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [postToken, router]);

  const seoMeta: SeoMeta = {
    title: "Voice Agent Demo | Colaberry AI",
    description:
      "Real-time conversational voice agent powered by LiveKit, LangGraph, and multi-language speech (Sarvam + Groq + OpenAI) with sub-1.2s round-trip latency.",
    canonical: buildCanonical("/demo/voice"),
  };

  const iframeSrc = `${VOICE_AGENT_URL}?embedded=true&theme=${theme}`;

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
              name: "Voice Agent",
              description: seoMeta.description,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai"}/demo/voice`,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
            }).replace(/</g, "\\u003c"),
          }}
        />
        <link rel="preconnect" href={VOICE_AGENT_URL} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={VOICE_AGENT_URL} />
      </Head>

      {/*
        Flex column fills exactly the space left by main-offset's padding (1rem top + 1.5rem bottom)
        plus the fixed site header. Title bar is shrink-0; iframe wrapper takes flex-1.
        This replaces an earlier `calc(100dvh - header - 72px)` magic-number that did not
        account for main-offset's padding, causing the iframe bottom (where the
        "call on phone" button lives) to be clipped below the viewport.
      */}
      <div
        className="flex flex-col"
        style={{ height: "calc(100dvh - var(--site-header-height) - 1rem - 1.5rem)" }}
      >
        {/* Compact title bar — keeps branding without eating viewport */}
        <div className="flex shrink-0 items-center justify-between pb-3 pt-1">
          <div className="flex items-center gap-3">
            <Link
              href="/demo/voice-agent"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              aria-label="Back to demo details"
            >
              <span aria-hidden="true">&larr;</span>
              Details
            </Link>
            <span className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#DC2626] dark:text-[#F87171]">
              Live Demo
            </span>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 sm:text-xl">
              Voice Agent
            </h1>
          </div>
          <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
            Audio processed via LiveKit &middot; never stored
          </p>
        </div>

        {/* Immersive iframe — fills remaining viewport */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
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
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Loading demo&hellip;
                </p>
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Demo temporarily unavailable
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Please try again later or{" "}
                  <Link
                    href="/request-demo"
                    className="text-[#B91C1C] underline dark:text-[#EF4444]"
                  >
                    request a live walkthrough
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {!error && (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              allow="microphone; autoplay"
              title="Voice Agent Demo"
              aria-hidden={!loaded}
              className="h-full w-full"
              style={{
                border: "none",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
              onLoad={() => {
                setLoaded(true);
                // Proactively hand over the token in case the child's
                // auth-request raced ahead of our listener.
                postToken();
              }}
              onError={() => setError(true)}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

/**
 * Read the signed-in user's session JWT server-side (the cookie is httpOnly, so
 * the client can't) and hand it to the page so it can postMessage it into the
 * voice iframe. Never cached — the token is per-user.
 */
export const getServerSideProps: GetServerSideProps<DemoVoiceProps> = async (ctx) => {
  ctx.res.setHeader("Cache-Control", "no-store");
  let initialToken: string | null = null;
  try {
    const claims = await resolveSession(ctx.req);
    if (claims) initialToken = readSessionToken(ctx.req) ?? null;
  } catch {
    /* not logged in / auth not configured — anon iframe */
  }
  return { props: { initialToken } };
};
