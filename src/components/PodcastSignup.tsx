import { FormEvent, useMemo, useState } from "react";
import { getTrackingContext } from "../lib/tracking";

type PodcastSignupProps = {
  sourcePath?: string;
  sourcePage?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

type SubmissionState = "idle" | "submitting" | "success" | "error";

const DEFAULT_TITLE = "Subscribe to Podcast";
const DEFAULT_DESCRIPTION = "Get notified when new episodes drop.";

export default function PodcastSignup({
  sourcePath,
  sourcePage = "unknown",
  compact = false,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  ctaLabel = "Subscribe",
}: PodcastSignupProps) {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [unsubscribeUrl, setUnsubscribeUrl] = useState<string | null>(null);
  const trackingContext = useMemo(() => getTrackingContext(), []);

  const resolvedSourcePath = useMemo(() => {
    if (sourcePath) return sourcePath;
    if (typeof window === "undefined") return undefined;
    return `${window.location.pathname}${window.location.search || ""}`;
  }, [sourcePath]);

  /** POST email to Substack via hidden iframe (no redirect, no popup) */
  function postToSubstack(emailAddress: string) {
    const SUBSTACK_URL = "https://www.colaberry.online/api/v1/free?nojs=true";
    const iframeName = "substack-podcast-subscribe-iframe";
    let iframe = document.querySelector<HTMLIFrameElement>(`iframe[name="${iframeName}"]`);
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.name = iframeName;
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = SUBSTACK_URL;
    form.target = iframeName;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "email";
    input.value = emailAddress;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }


  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;

    setState("submitting");
    setMessage(null);
    setUnsubscribeUrl(null);

    try {
      const response = await fetch("/api/podcast-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website,
          consent,
          sourcePath: resolvedSourcePath,
          sourcePage,
          utmSource: trackingContext.utmSource,
          utmMedium: trackingContext.utmMedium,
          utmCampaign: trackingContext.utmCampaign,
          utmTerm: trackingContext.utmTerm,
          utmContent: trackingContext.utmContent,
          referrer: trackingContext.referrer,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        reason?: string;
        unsubscribeUrl?: string | null;
      };

      if (!response.ok || !payload?.ok) {
        setState("error");
        setMessage(payload?.message || "Unable to subscribe right now. Please try again.");
        return;
      }

      setState("success");
      // Also subscribe via Substack for email delivery
      postToSubstack(email);
      setMessage(payload?.message || "Podcast subscription confirmed.");
      setUnsubscribeUrl(payload?.unsubscribeUrl || null);
      setEmail("");
      setWebsite("");
      setConsent(false);
    } catch {
      setState("error");
      setMessage("Unable to subscribe right now. Please try again.");
    }
  }

  const statusClass =
    state === "success"
      ? "text-[var(--trusted-text)] dark:text-[var(--trusted-text)]"
      : state === "error"
      ? "text-[var(--failure-text)] dark:text-[var(--failure-text)]"
      : "text-zinc-500 dark:text-zinc-400";

  const consentId = `podcast-consent-${sourcePage}`;

  return (
    <div className={compact ? "rounded-lg border border-zinc-200/80 bg-white/80 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/70" : ""}>
      <div className={compact ? "text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400" : "text-sm font-semibold text-zinc-900 dark:text-zinc-50"}>
        {title}
      </div>
      <p className={compact ? "mt-1 text-xs text-zinc-500 dark:text-zinc-400" : "mt-1 text-sm text-zinc-500 dark:text-zinc-400"}>
        {description}
      </p>
      <form onSubmit={onSubmit} className={compact ? "mt-3 flex flex-col gap-2" : "mt-3 flex flex-col gap-2"}>
        <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-2 sm:flex-row"}>
          <label htmlFor={`podcast-email-${sourcePage}`} className="sr-only">
            Email
          </label>
          <input
            id={`podcast-email-${sourcePage}`}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "true" : undefined}
            aria-describedby={emailTouched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `podcast-email-error-${sourcePage}` : undefined}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="Email address"
            className="input-premium"
          />
          {emailTouched && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p id={`podcast-email-error-${sourcePage}`} className="text-xs text-red-600" role="alert">Please enter a valid email address.</p>
          )}
          <label htmlFor={`podcast-website-${sourcePage}`} className="sr-only">
            Website
          </label>
          <input
            id={`podcast-website-${sourcePage}`}
            name="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <button
            type="submit"
            className={compact ? "btn btn-cta btn-sm" : "btn btn-cta"}
            disabled={state === "submitting" || !consent}
            aria-disabled={!consent}
          >
            {state === "submitting" ? "Subscribing..." : ctaLabel}
          </button>
        </div>

        <label htmlFor={consentId} className="mt-1 flex items-start gap-2 cursor-pointer">
          <input
            id={consentId}
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            aria-required="true"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-brand-purple-600 focus:ring-2 focus:ring-brand-purple-600/25 dark:border-zinc-600"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
            I agree to receive podcast notifications from Colaberry AI
          </span>
        </label>
      </form>
      {message ? (
        <p className={`mt-2 text-xs ${statusClass}`} role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {state === "success" && unsubscribeUrl ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Need to opt out?
          {" "}
          <a
            href={unsubscribeUrl}
            className="font-medium text-brand-purple-600 hover:underline dark:text-brand-purple-300"
          >
            Unsubscribe
          </a>
        </p>
      ) : null}
    </div>
  );
}
