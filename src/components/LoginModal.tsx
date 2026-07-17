import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

/**
 * In-place email magic-link login modal for the demo gate (e.g. /demo/voice).
 *
 * Instead of bouncing the whole tab to /login, the demo pops this modal at the
 * conversion moment ("unlock ₹100"). Flow: enter email → POST
 * /api/auth/request-link → "check your inbox". Because it's magic-link, the
 * actual sign-in completes when the user clicks the emailed link (a new tab →
 * /auth/verify sets the session). So while open, this polls /api/auth/me and,
 * the moment the session appears, calls `onAuthenticated()` — the original tab
 * auto-unlocks without the user manually returning.
 *
 * Same request-link call + states as the /login page; zinc + coral, locked theming.
 *
 * Accessibility: this is a true modal dialog — focus is trapped inside it, the
 * background is inert + scroll-locked while open, focus is restored to the
 * trigger on close, and the "check your inbox" outcome is announced (live region
 * + focus move) so a screen-reader user learns the email was sent. The behaviour
 * mirrors the search overlay in Layout.tsx.
 */

type Status = "idle" | "submitting" | "sent" | "error";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** Fired once /api/auth/me reports an authenticated session (poll or after send). */
  onAuthenticated: () => void;
  /** Same-site path baked into the magic link so the email-tab returns here. */
  redirect?: string;
  title?: string;
  subtitle?: string;
}

export default function LoginModal({
  open,
  onClose,
  onAuthenticated,
  redirect = "/demo/voice",
  title = "Sign in to keep talking",
  subtitle = "Enter your email to unlock ₹100 of free usage — no password, just a secure sign-in link.",
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const onAuthedRef = useRef(onAuthenticated);
  useEffect(() => {
    onAuthedRef.current = onAuthenticated;
  }, [onAuthenticated]);
  // Kept in a ref so the dialog effect can depend on [open] alone — both mount
  // sites pass an inline onClose, and depending on it would tear down + re-run
  // the whole effect (releasing scroll-lock/inert, bouncing focus) on any host
  // re-render while the modal is open.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // (State is reset per-open by a `key` on the parent's <LoginModal>, so the
  // modal remounts fresh each time — no setState-in-effect reset needed.)

  // While open, poll /api/auth/me — when the user clicks the emailed link in
  // another tab the session cookie appears here and we auto-complete.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const id = window.setInterval(() => {
      fetch("/api/auth/me", { credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { authenticated?: boolean } | null) => {
          if (alive && d?.authenticated) {
            window.clearInterval(id);
            onAuthedRef.current();
          }
        })
        .catch(() => {});
    }, 3000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [open]);

  // Modal dialog behaviour: scroll-lock, focus trap, inert background, and focus
  // restore on close. Ported from the search overlay (Layout.tsx) so the hand-
  // rolled dialog actually honours the `aria-modal` it declares.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("aria-hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const backgroundNodes = [
      document.querySelector("header"),
      document.querySelector("main"),
      document.querySelector("footer"),
    ].filter(Boolean) as HTMLElement[];
    backgroundNodes.forEach((node) => {
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("inert", "");
    });

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      backgroundNodes.forEach((node) => {
        node.removeAttribute("aria-hidden");
        node.removeAttribute("inert");
      });
      window.clearTimeout(focusTimer);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  // When the form is replaced by "Check your inbox", the focused submit button
  // is unmounted and focus would fall to <body>. Move it to the confirmation
  // heading (which sits in a live region) so screen-reader users learn the
  // outcome and stay inside the dialog.
  useEffect(() => {
    if (status === "sent") sentHeadingRef.current?.focus();
  }, [status]);

  if (!open) return null;

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
    <div
      className="animate-fade-in fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6 18 18M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>

        {status === "sent" ? (
          <div className="text-center" role="status" aria-live="polite">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </div>
            <h2
              ref={sentHeadingRef}
              tabIndex={-1}
              id="login-modal-title"
              className="text-xl font-bold text-zinc-900 outline-none dark:text-zinc-50"
            >
              Check your inbox
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              We sent a sign-in link to{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-200">{email}</span>. Click it —
              this page unlocks automatically once you do. The link expires in 15 minutes and works once.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-[#DC2626] dark:border-zinc-600 dark:border-t-[#F87171]" aria-hidden="true" />
              Waiting for you to click the link…
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setError("");
              }}
              className="mt-5 text-sm font-medium text-[#DC2626] hover:underline dark:text-[#F87171]"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div>
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-label font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
              <span>Sign in</span>
            </span>
            <h2 id="login-modal-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{subtitle}</p>

            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
              <input
                ref={inputRef}
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                aria-label="Email address"
                aria-invalid={status === "error"}
                aria-describedby={status === "error" && error ? "login-modal-error" : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {status === "error" && error ? (
                <p id="login-modal-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#DC2626] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Email me a sign-in link"}
              </button>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                No password is ever stored. You&apos;ll get a one-time sign-in link and occasional product updates.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
