import { useState } from "react";
import type { FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

/**
 * Global email magic-link login for colaberry.ai. Enter email → we send a
 * secure sign-in link (Resend, or the server console in dev) → the link lands
 * on /auth/verify which mints the shared session. No password anywhere.
 *
 * `?redirect=<same-site path>` is remembered and baked into the magic link so
 * the user returns to where they started (e.g. /demo/voice) after signing in.
 * Utility page: noindex + no .reveal (guaranteed visibility beats animation).
 */

type Status = "idle" | "submitting" | "sent" | "error";

function safeRedirect(raw: unknown): string {
  if (typeof raw !== "string" || !raw || raw.length > 512) return "";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "";
  if (/[\x00-\x1f\\]/.test(raw)) return "";
  try {
    if (new URL(raw, "https://colaberry.ai").origin !== "https://colaberry.ai") return "";
  } catch {
    return "";
  }
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const redirect = safeRedirect(router.query.redirect);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), redirect }),
      });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setError(data?.message || "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <Layout>
      <Head>
        <title>Sign in | Colaberry AI</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Sign in to Colaberry AI to access the interactive demos." />
      </Head>

      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center py-16">
        {status === "sent" ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Check your inbox</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              We sent a sign-in link to{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{email}</span>. Click
              it to finish signing in — the link expires in 15 minutes and works once.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setError("");
              }}
              className="mt-6 text-sm font-medium text-[#DC2626] hover:underline dark:text-[#F87171]"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8 flex flex-col gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-label font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                <span>Sign in</span>
              </span>
              <h1 className="text-display-xs font-bold text-zinc-900 dark:text-zinc-50 sm:text-display-sm">
                Sign in to Colaberry AI
              </h1>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-base">
                Enter your email and we&apos;ll send a secure sign-in link — no password needed. It
                unlocks the interactive demos.
              </p>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Work email</span>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </label>

              {status === "error" && error ? (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#DC2626] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send me a sign-in link"}
              </button>

              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                By continuing, you agree to receive a one-time sign-in link and occasional product
                updates from Colaberry. No password is ever stored.
              </p>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
