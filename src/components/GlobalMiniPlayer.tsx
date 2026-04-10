/**
 * GlobalMiniPlayer — Fixed bottom bar that shows when a podcast is playing.
 *
 * Hidden when the user is on the detail page of the currently playing episode
 * (since that page has its own full player). Visible on all other pages.
 */
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { usePodcastPlayer } from "../contexts/PodcastPlayerContext";

const PODCAST_BRAND_IMAGE = "/media/podcast/colaberry-ai-podcast-brand.svg";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GlobalMiniPlayer() {
  const { currentEpisode, isPlaying, currentTime, duration, togglePlayback, stop } =
    usePodcastPlayer();
  const router = useRouter();

  // Don't render if nothing is loaded
  if (!currentEpisode) return null;

  // Hide on the detail page of the currently playing episode (it has its own player)
  const detailPath = `/resources/podcasts/${currentEpisode.slug}`;
  if (router.asPath.startsWith(detailPath)) return null;

  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <aside role="complementary" aria-label="Audio mini player" className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800/60 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/80">
      {/* Progress bar — thin line at top of mini player */}
      <div
        role="progressbar"
        aria-label="Playback progress"
        aria-valuenow={Math.round(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        className="h-0.5 w-full bg-zinc-200/60 dark:bg-zinc-800"
      >
        <div
          className="h-full bg-[#DC2626] transition-[width] duration-200 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        {/* Cover art */}
        <Link href={detailPath} className="shrink-0" aria-label={`Go to ${currentEpisode.title}`}>
          <Image
            src={currentEpisode.coverImageUrl || PODCAST_BRAND_IMAGE}
            alt={currentEpisode.coverImageAlt || currentEpisode.title}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg"
          />
        </Link>

        {/* Episode info */}
        <Link href={detailPath} className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {currentEpisode.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </Link>

        {/* Play/Pause */}
        <button
          type="button"
          onClick={togglePlayback}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white shadow-sm transition-transform hover:scale-105 motion-reduce:transition-none dark:bg-zinc-100 dark:text-zinc-950"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Close / Stop */}
        <button
          type="button"
          onClick={stop}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label="Stop playback"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
