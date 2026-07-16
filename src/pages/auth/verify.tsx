import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";

/**
 * Magic-link landing page. The email link points here (/auth/verify?token=…).
 * On mount we POST the token to /api/auth/verify, which burns the single-use
 * nonce, sets the session cookie, and captures the lead — then we redirect to
 * the (validated, same-site) `redirect` target or home.
 *
 * POST-on-mount (not a GET endpoint) so email-client link *prefetchers* — which
 * issue bare GETs and don't run JS — can't silently burn a one-shot link before
 * the human clicks. Utility page: noindex.
 */

type Phase = "verifying" | "success" | "error";

function safeRedirect(raw: unknown): string {
  if (typeof raw !== "string" || !raw || raw.length > 512) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  if (/[\x00-\x1f\\]/.test(raw)) return "/";
  try {
    if (new URL(raw, "https://colaberry.ai").origin !== "https://colaberry.ai") return "/";
  } catch {
    return "/";
  }
  return raw;
}

export default function VerifyPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("verifying");
  const [message, setMessage] = useState("");
  const attempted = useRef(false);

  useEffect(() => {
    if (!router.isReady || attempted.current) return;
    attempted.current = true;
    const token = typeof router.query.token === "string" ? router.query.token : "";
    const redirect = safeRedirect(router.query.redirect);
    void (async () => {
      if (!token) {
        setPhase("error");
        setMessage("This sign-in link is missing its token. Please request a new one.");
        return;
      }
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
        if (res.ok && data?.ok) {
          setPhase("success");
          window.setTimeout(() => {
            void router.replace(redirect);
          }, 900);
          return;
        }
        setPhase("error");
        setMessage(data?.message || "This sign-in link is invalid or has expired.");
      } catch {
        setPhase("error");
        setMessage("Network error. Please try the link again.");
      }
    })();
  }, [router.isReady, router.query.token, router.query.redirect, router]);

  return (
    <Layout>
      <Head>
        <title>Signing you in… | Colaberry AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center py-16 text-center">
        {phase === "verifying" && (
          <>
            <div
              className="mb-5 h-9 w-9 animate-spin rounded-full border-2 border-zinc-300 border-t-[#DC2626] dark:border-zinc-600 dark:border-t-[#F87171]"
              aria-hidden="true"
            />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Signing you in…</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Verifying your secure link.</p>
          </>
        )}

        {phase === "success" && (
          <>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">You&apos;re signed in</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Taking you back…</p>
          </>
        )}

        {phase === "error" && (
          <>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Sign-in link problem</h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {message}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#DC2626] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C]"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </Layout>
  );
}
