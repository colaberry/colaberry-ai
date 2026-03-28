/**
 * PodcastPlayerContext — Global audio player that persists across page navigations.
 *
 * Owns a single <audio> element rendered in _app.tsx so it survives
 * Next.js Pages Router unmount/remount cycles. Both the podcast listing
 * page and detail page consume this context instead of managing their
 * own audio elements.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ── Minimal episode shape needed by the global player ── */
export type PodcastEpisodeMini = {
  slug: string;
  title: string;
  audioUrl: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  duration?: string | null;
};

/* ── Context value ── */
type PodcastPlayerContextValue = {
  /** The single global <audio> element ref */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** Currently loaded episode (null when nothing is loaded) */
  currentEpisode: PodcastEpisodeMini | null;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Current playback position in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Load + play an episode. If same episode, toggles pause/play. */
  play: (episode: PodcastEpisodeMini) => void;
  /** Pause playback */
  pause: () => void;
  /** Toggle play/pause for current episode */
  togglePlayback: () => void;
  /** Stop playback and unload episode */
  stop: () => void;
  /** Seek to a position in seconds */
  seek: (time: number) => void;
  /** Check if a given slug is the currently loaded episode */
  isCurrentEpisode: (slug: string) => boolean;
};

const PodcastPlayerContext = createContext<PodcastPlayerContextValue | null>(null);

/* ── Provider ── */
export function PodcastPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisodeMini | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Persist time to localStorage every ~2s for crash recovery
  const lastSavedRef = useRef(0);

  /* ── Sync state from audio element events ── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      localStorage.removeItem("podcast-playing-slug");
      localStorage.removeItem("podcast-playing-time");
    };
    const onTimeUpdate = () => {
      const t = audio.currentTime;
      setCurrentTime(t);
      // Throttled localStorage write
      if (t - lastSavedRef.current >= 2) {
        lastSavedRef.current = t;
        localStorage.setItem("podcast-playing-time", String(t));
      }
    };
    const onDurationChange = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(d);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("durationchange", onDurationChange);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("durationchange", onDurationChange);
    };
  }, []);

  /* ── Restore session on mount (crash recovery) ── */
  useEffect(() => {
    const savedSlug = localStorage.getItem("podcast-playing-slug");
    const savedTime = parseFloat(localStorage.getItem("podcast-playing-time") || "0");
    const savedTitle = localStorage.getItem("podcast-playing-title") || "";
    const savedAudioUrl = localStorage.getItem("podcast-playing-audioUrl") || "";
    const savedCover = localStorage.getItem("podcast-playing-cover") || "";

    if (savedSlug && savedAudioUrl) {
      // Restore episode metadata (won't autoplay — just pre-load for resume)
      setCurrentEpisode({
        slug: savedSlug,
        title: savedTitle,
        audioUrl: savedAudioUrl,
        coverImageUrl: savedCover || null,
      });

      const audio = audioRef.current;
      if (audio) {
        audio.src = savedAudioUrl;
        audio.preload = "metadata";
        // Set position once metadata loads
        const onReady = () => {
          if (savedTime > 0) audio.currentTime = savedTime;
          audio.removeEventListener("loadedmetadata", onReady);
        };
        audio.addEventListener("loadedmetadata", onReady);
      }
    }
    // Only on mount
  }, []);

  /* ── Actions ── */
  const play = useCallback((episode: PodcastEpisodeMini) => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentEpisode((prev) => {
      if (prev?.slug === episode.slug) {
        // Same episode → toggle play/pause
        if (audio.paused) {
          audio.play().catch(() => undefined);
        } else {
          audio.pause();
        }
        return prev;
      }

      // New episode → load and play
      audio.src = episode.audioUrl;
      audio.play().catch(() => undefined);

      // Persist for crash recovery + cross-page resume
      localStorage.setItem("podcast-playing-slug", episode.slug);
      localStorage.setItem("podcast-playing-time", "0");
      localStorage.setItem("podcast-playing-title", episode.title);
      localStorage.setItem("podcast-playing-audioUrl", episode.audioUrl);
      localStorage.setItem("podcast-playing-cover", episode.coverImageUrl || "");
      lastSavedRef.current = 0;

      return episode;
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setCurrentEpisode(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    localStorage.removeItem("podcast-playing-slug");
    localStorage.removeItem("podcast-playing-time");
    localStorage.removeItem("podcast-playing-title");
    localStorage.removeItem("podcast-playing-audioUrl");
    localStorage.removeItem("podcast-playing-cover");
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
  }, []);

  const isCurrentEpisode = useCallback(
    (slug: string) => currentEpisode?.slug === slug,
    [currentEpisode]
  );

  const value: PodcastPlayerContextValue = {
    audioRef,
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlayback,
    stop,
    seek,
    isCurrentEpisode,
  };

  return (
    <PodcastPlayerContext.Provider value={value}>
      {/* The single global audio element — lives in _app.tsx, survives navigation */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PodcastPlayerContext.Provider>
  );
}

/* ── Hook ── */
export function usePodcastPlayer(): PodcastPlayerContextValue {
  const ctx = useContext(PodcastPlayerContext);
  if (!ctx) {
    throw new Error("usePodcastPlayer must be used within PodcastPlayerProvider");
  }
  return ctx;
}
