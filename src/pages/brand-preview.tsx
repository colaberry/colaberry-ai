/**
 * Brand Logo Preview V13 — ColaberryAI Research Labs
 *
 * NEW: 8 agent-generated concepts (V11–V18) using the Subconscious Visual Clue framework.
 * Each concept applies the 12 Embedding Techniques from the upgraded Canvas Designer agent.
 * Triple-clue targets: Co/o = berry, AI = intelligence, Labs = science.
 *
 * Previous V1–V10 preserved at bottom for reference.
 */
import Head from "next/head";

const C = {
  dark:   "#09090B",
  white:  "#FAFAFA",
  gray:   "#A1A1AA",
  berry:  "#DC2626",
  coral:  "#F87171",
  teal:   "#3D7C9E",
  tealLt: "#5BA3C9",
  tbi:    "#357895",
  tbiLt:  "#4A9BBF",
  black:  "#18181B",
};

const FONT = "var(--font-inter), Inter, system-ui, sans-serif";

type ColorScheme = "coral" | "teal" | "tbi";
const ALL_SCHEMES: ColorScheme[] = ["tbi"];

function accentColor(color: ColorScheme, mode: "dark" | "light") {
  if (color === "teal") return mode === "dark" ? C.tealLt : C.teal;
  if (color === "tbi") return mode === "dark" ? C.tbiLt : C.tbi;
  return mode === "dark" ? C.coral : C.berry;
}

function wordmarkTxt(_color: ColorScheme, mode: "dark" | "light") {
  return mode === "dark" ? C.white : C.black;
}

function wordmarkAI(color: ColorScheme, mode: "dark" | "light") {
  if (color === "tbi") return mode === "dark" ? C.tbiLt : C.tbi;
  if (color === "teal") return mode === "dark" ? C.tealLt : C.teal;
  return mode === "dark" ? C.coral : C.berry;
}

function berryColor(color: ColorScheme, mode: "dark" | "light") {
  if (color === "tbi") return mode === "dark" ? C.tbiLt : C.tbi;
  if (color === "teal") return mode === "dark" ? C.tealLt : C.teal;
  return mode === "dark" ? C.coral : C.berry;
}

/* ══════════════════════════════════════════════════════════════════
   V13 — AGENT-GENERATED CONCEPTS (Subconscious Visual Clue Framework)

   12 Embedding Techniques applied:
   1. Negative Space  2. Dual-Read Shape  3. Letterform Modification
   4. Tittle Replacement  5. Crossbar Substitution  6. Counter Shaping
   7. Ligature Creation  8. Stem Extension  9. Terminal Modification
   10. Baseline Disruption  11. Scale Variation  12. Color Isolation
   ══════════════════════════════════════════════════════════════════ */

/** V11: "The C-Berry Cradle"
 *  Technique: #3 Letterform Modification + #12 Color Isolation
 *  Heritage callback: C wraps around like a leaf cupping the berry "o".
 *  The "o" is a berry (red circle + stem). C's terminal curves INTO the berry.
 *  AI in TBI Steel Blue. "Labs" dot is a tiny atom ring.
 *  Clues: Co = C cradles berry-o | AI = color-coded intelligence | Labs = atom dot
 *  Elements: 5 */
function WordmarkCBerryCradle({ scale = 1, mode = "dark", color = "tbi" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const ai = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  const fs = sz(48);
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }} role="img" aria-label="ColaberryAI Research Labs">
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: fs }}>
        {/* "C" with extended terminal curving toward berry */}
        <span className="inline-block relative" style={{ width: sz(32), height: fs, verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 32 48" width={sz(32)} height={fs} style={{ pointerEvents: "none" }}>
            {/* C letterform with extended lower terminal */}
            <path d="M28,14 A14,14 0 1,0 28,36 L26,34 A11,11 0 1,1 26,16 Z" fill={txt} />
            {/* Extended C terminal reaching toward berry */}
            {scale >= 0.45 && <path d="M28,34 Q32,38 30,42" stroke={txt} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />}
          </svg>
        </span>
        {/* Berry "o" — nestled in C's cradle */}
        <span className="inline-block relative" style={{ width: sz(24), height: fs, verticalAlign: "baseline", marginLeft: sz(-4) }} aria-hidden="true">
          <svg viewBox="0 0 24 48" width={sz(24)} height={fs} style={{ pointerEvents: "none" }}>
            <circle cx="12" cy="31" r="10" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            {scale >= 0.45 && <path d="M12,21 C12.5,16.5 13.5,13 15,10" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
            {/* Leaves — large filled shapes unmistakably berry-like */}
            {scale >= 0.5 && <>
              <path d="M13.5,11.5 C11,9 8.5,10.5 10.5,13.5 C11.5,14.5 13,13.5 13.5,11.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
              <path d="M15,10.5 C17.5,7.5 20,9 18.5,12 C17.5,13.5 15.5,12.5 15,10.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            </>}
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt }}>laberry</span>
        <span className="font-extrabold" style={{ color: ai }}>AI</span>
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(4) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        {/* Atom dot — Labs science clue */}
        <svg viewBox="0 0 12 12" width={sz(10)} height={sz(10)} aria-hidden="true" style={{ pointerEvents: "none" }}>
          <circle cx="6" cy="6" r="2.5" fill={bf} opacity="0.7" />
          {scale >= 0.5 && <ellipse cx="6" cy="6" rx="5" ry="2.5" stroke={bf} strokeWidth="0.8" fill="none" opacity="0.4" />}
        </svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Labs</span>
      </div>
    </div>
  );
}

/** V12: "The Signal Mind"
 *  Technique: #5 Crossbar Substitution + #4 Tittle Replacement + #6 Counter Shaping
 *  TRIPLE EMBED: "o" = berry, A-crossbar = EEG signal wave, I-dot = neural pulse,
 *  A's counter space = eye of intelligence (triangle void reads as watchful eye).
 *  "Labs" separator = tiny microscope lens circle.
 *  Clues: o = berry | A = signal + eye | I = neural pulse | Labs = lens
 *  Elements: 7 */
function WordmarkSignalMind({ scale = 1, mode = "dark", color = "tbi" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const ai = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  const fs = sz(48);
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }} role="img" aria-label="ColaberryAI Research Labs">
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: fs }}>
        <span className="font-semibold" style={{ color: txt }}>C</span>
        {/* Berry "o" — circle + stem */}
        <span className="inline-block relative" style={{ width: sz(26), height: fs, verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 26 48" width={sz(26)} height={fs} style={{ pointerEvents: "none" }}>
            <circle cx="13" cy="31" r="10.5" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            {scale >= 0.4 && <path d="M13,20.5 C13.5,16 14.5,13 16,10" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
            {/* Leaves — large filled shapes unmistakably berry-like */}
            {scale >= 0.5 && <>
              <path d="M14.5,11.5 C12,9 9.5,10.5 11.5,13.5 C12.5,14.5 14,13.5 14.5,11.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
              <path d="M16,10.5 C18.5,7.5 21,9 19.5,12 C18.5,13.5 16.5,12.5 16,10.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            </>}
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt }}>laberry</span>
        {/* "A" — crossbar is a sine wave (intelligence signal) + counter reads as "eye" */}
        <span className="relative inline-block font-extrabold" style={{ color: ai }}>
          A
          {scale >= 0.4 && (
            <svg viewBox="0 0 24 10" width={sz(20)} height={sz(7)} className="absolute"
              style={{ top: sz(22), left: sz(4), pointerEvents: "none" }} aria-hidden="true">
              <path d="M0,5 Q6,1 12,5 Q18,9 24,5" stroke={bf} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.75" />
            </svg>
          )}
          {/* Eye in A's counter — subtle circle in the triangle void */}
          {scale >= 0.6 && (
            <svg viewBox="0 0 10 6" width={sz(8)} height={sz(5)} className="absolute"
              style={{ top: sz(14), left: sz(8), pointerEvents: "none" }} aria-hidden="true">
              <ellipse cx="5" cy="3" rx="4" ry="2.5" stroke={bf} strokeWidth="1" fill="none" opacity="0.25" />
              <circle cx="5" cy="3" r="1.2" fill={bf} opacity="0.3" />
            </svg>
          )}
        </span>
        {/* "I" — tittle is a neural pulse (enlarged + ring) */}
        <span className="relative inline-block font-extrabold" style={{ color: ai }}>
          I
          <svg viewBox="0 0 14 14" width={sz(12)} height={sz(12)} className="absolute" style={{ top: sz(-6), left: sz(1), pointerEvents: "none" }} aria-hidden="true">
            <circle cx="7" cy="7" r="4" fill={bf} />
            {scale >= 0.5 && <circle cx="7" cy="7" r="6.5" stroke={bf} strokeWidth="1" fill="none" opacity="0.3" />}
          </svg>
        </span>
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(4) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        <svg viewBox="0 0 8 8" width={sz(7)} height={sz(7)} aria-hidden="true"><circle cx="4" cy="4" r="3" fill={bf} opacity="0.5" />{scale >= 0.5 && <circle cx="4" cy="4" r="2" stroke={txt} strokeWidth="0.6" fill="none" opacity="0.2" />}</svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Labs</span>
      </div>
    </div>
  );
}

/** V13: "The Ligature Flow"
 *  Technique: #7 Ligature Creation + #3 Letterform Modification
 *  "A" and "I" are connected by a single flowing stroke — intelligence flowing
 *  as one continuous line. The "o" is a berry. "Labs" has a helix 'a'.
 *  Clues: o = berry | AI = flowing intelligence ligature | Labs = helix hint
 *  Elements: 5 */
function WordmarkLigatureFlow({ scale = 1, mode = "dark", color = "tbi" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const ai = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  const fs = sz(48);
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }} role="img" aria-label="ColaberryAI Research Labs">
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: fs }}>
        <span className="font-semibold" style={{ color: txt }}>C</span>
        {/* Berry "o" */}
        <span className="inline-block relative" style={{ width: sz(26), height: fs, verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 26 48" width={sz(26)} height={fs} style={{ pointerEvents: "none" }}>
            <circle cx="13" cy="31" r="10.5" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            {scale >= 0.4 && <path d="M13,20.5 C13.5,16 14.5,13 16,10" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
            {/* Leaves — large filled shapes unmistakably berry-like */}
            {scale >= 0.5 && <>
              <path d="M14.5,11.5 C12,9 9.5,10.5 11.5,13.5 C12.5,14.5 14,13.5 14.5,11.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
              <path d="M16,10.5 C18.5,7.5 21,9 19.5,12 C18.5,13.5 16.5,12.5 16,10.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            </>}
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt }}>laberry</span>
        {/* "AI" ligature — A's right leg flows into I's stem */}
        <span className="relative inline-block" style={{ width: sz(52), height: fs, verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 52 52" width={sz(52)} height={fs} style={{ pointerEvents: "none" }}>
            {/* A shape */}
            <path d="M2,44 L18,6 L34,44" stroke={ai} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* A crossbar */}
            <line x1="9" y1="30" x2="27" y2="30" stroke={ai} strokeWidth="3.5" strokeLinecap="round" />
            {/* Flowing connection: A's right leg curves up into I stem */}
            <path d="M34,44 Q38,44 40,6" stroke={ai} strokeWidth="4.5" fill="none" strokeLinecap="round" />
            {/* I tittle as berry node */}
            <circle cx="40" cy="2" r="4" fill={bf} />
          </svg>
        </span>
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(4) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        <svg viewBox="0 0 6 6" width={sz(5)} height={sz(5)} aria-hidden="true"><circle cx="3" cy="3" r="3" fill={bf} opacity="0.6" /></svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Labs</span>
      </div>
    </div>
  );
}

/** V14: "The Eye of Intelligence"
 *  Technique: #6 Counter Shaping + #4 Tittle Replacement
 *  A's triangular counter is shaped as a stylized eye — intelligence watching.
 *  "o" = berry. I-dot = berry node. Minimal, geometric.
 *  Clues: o = berry | A-counter = eye of AI | I-dot = knowledge node
 *  Elements: 5 */
function WordmarkEyeIntel({ scale = 1, mode = "dark", color = "tbi" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const ai = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  const fs = sz(48);
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }} role="img" aria-label="ColaberryAI Research Labs">
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: fs }}>
        <span className="font-semibold" style={{ color: txt }}>C</span>
        {/* Berry "o" */}
        <span className="inline-block relative" style={{ width: sz(26), height: fs, verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 26 48" width={sz(26)} height={fs} style={{ pointerEvents: "none" }}>
            <circle cx="13" cy="31" r="10.5" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            {scale >= 0.4 && <path d="M13,20.5 C13.5,16 14.5,13 16,10" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
            {/* Leaves — large filled shapes unmistakably berry-like */}
            {scale >= 0.5 && <>
              <path d="M14.5,11.5 C12,9 9.5,10.5 11.5,13.5 C12.5,14.5 14,13.5 14.5,11.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
              <path d="M16,10.5 C18.5,7.5 21,9 19.5,12 C18.5,13.5 16.5,12.5 16,10.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            </>}
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt }}>laberry</span>
        {/* "A" with eye in counter space */}
        <span className="relative inline-block font-extrabold" style={{ color: ai }}>
          A
          {scale >= 0.5 && (
            <svg viewBox="0 0 16 10" width={sz(14)} height={sz(9)} className="absolute"
              style={{ top: sz(13), left: sz(5), pointerEvents: "none" }} aria-hidden="true">
              {/* Eye shape: almond / leaf form */}
              <path d="M1,5 Q8,0 15,5 Q8,10 1,5 Z" stroke={bf} strokeWidth="1.2" fill="none" opacity="0.4" />
              {/* Iris */}
              <circle cx="8" cy="5" r="2.2" fill={bf} opacity="0.5" />
              {/* Pupil */}
              <circle cx="8" cy="5" r="1" fill={bf} opacity="0.8" />
            </svg>
          )}
        </span>
        {/* "I" with accent tittle */}
        <span className="relative inline-block font-extrabold" style={{ color: ai }}>
          I
          <svg viewBox="0 0 10 10" width={sz(9)} height={sz(9)} className="absolute" style={{ top: sz(-5), left: sz(2), pointerEvents: "none" }} aria-hidden="true">
            <circle cx="5" cy="5" r="4.5" fill={bf} />
          </svg>
        </span>
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(4) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        <svg viewBox="0 0 6 6" width={sz(5)} height={sz(5)} aria-hidden="true"><circle cx="3" cy="3" r="3" fill={bf} opacity="0.6" /></svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Labs</span>
      </div>
    </div>
  );
}

/** V15: "The Antenna Broadcast"
 *  Technique: #8 Stem Extension + #4 Tittle Replacement
 *  I's tittle replaced with broadcast/wifi arcs — AI broadcasting intelligence.
 *  "o" = berry. Clean and minimal.
 *  Clues: o = berry | I = broadcasting antenna | A = TBI blue = tech
 *  Elements: 6 */
function WordmarkAntenna({ scale = 1, mode = "dark", color = "tbi" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const ai = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  const fs = sz(48);
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }} role="img" aria-label="ColaberryAI Research Labs">
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: fs }}>
        <span className="font-semibold" style={{ color: txt }}>C</span>
        {/* Berry "o" */}
        <span className="inline-block relative" style={{ width: sz(26), height: fs, verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 26 48" width={sz(26)} height={fs} style={{ pointerEvents: "none" }}>
            <circle cx="13" cy="31" r="10.5" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            {scale >= 0.4 && <path d="M13,20.5 C13.5,16 14.5,13 16,10" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
            {/* Leaves — large filled shapes unmistakably berry-like */}
            {scale >= 0.5 && <>
              <path d="M14.5,11.5 C12,9 9.5,10.5 11.5,13.5 C12.5,14.5 14,13.5 14.5,11.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
              <path d="M16,10.5 C18.5,7.5 21,9 19.5,12 C18.5,13.5 16.5,12.5 16,10.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            </>}
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt }}>laberry</span>
        <span className="font-extrabold" style={{ color: ai }}>A</span>
        {/* "I" with broadcast arcs replacing tittle */}
        <span className="relative inline-block font-extrabold" style={{ color: ai }}>
          I
          <svg viewBox="0 0 24 18" width={sz(20)} height={sz(15)} className="absolute" style={{ top: sz(-9), left: sz(-3), pointerEvents: "none" }} aria-hidden="true">
            {/* Central dot (the "berry" of the antenna) */}
            <circle cx="12" cy="14" r="3" fill={bf} />
            {/* Broadcast arcs */}
            {scale >= 0.45 && <>
              <path d="M7,10 A6,6 0 0,1 17,10" stroke={bf} strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M3,6 A10,10 0 0,1 21,6" stroke={bf} strokeWidth="1.2" fill="none" opacity="0.3" />
            </>}
          </svg>
        </span>
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(4) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        <svg viewBox="0 0 6 6" width={sz(5)} height={sz(5)} aria-hidden="true"><circle cx="3" cy="3" r="3" fill={bf} opacity="0.6" /></svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Labs</span>
      </div>
    </div>
  );
}

/** V16: "The Constellation"
 *  Technique: #1 Negative Space + #12 Color Isolation
 *  3 berry-colored dots (o-tittle, I-tittle, Labs-dot) connected by hair-thin lines
 *  forming a micro-constellation = knowledge graph. Letters are clean.
 *  Clues: o = berry node | I-dot = neural node | connecting lines = knowledge graph
 *  Elements: 6 */
function WordmarkConstellation({ scale = 1, mode = "dark", color = "tbi" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const ai = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  const fs = sz(48);
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }} role="img" aria-label="ColaberryAI Research Labs">
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: fs }}>
        <span className="font-semibold" style={{ color: txt }}>C</span>
        {/* Berry "o" — node 1 */}
        <span className="inline-block relative" style={{ width: sz(26), height: fs, verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 26 48" width={sz(26)} height={fs} style={{ pointerEvents: "none" }}>
            <circle cx="13" cy="31" r="10.5" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            {scale >= 0.4 && <path d="M13,20.5 C13.5,16 14.5,13 16,10" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
            {/* Leaves — large filled shapes unmistakably berry-like */}
            {scale >= 0.5 && <>
              <path d="M14.5,11.5 C12,9 9.5,10.5 11.5,13.5 C12.5,14.5 14,13.5 14.5,11.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
              <path d="M16,10.5 C18.5,7.5 21,9 19.5,12 C18.5,13.5 16.5,12.5 16,10.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            </>}
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt }}>laberry</span>
        <span className="font-extrabold" style={{ color: ai }}>A</span>
        {/* "I" with accent node — node 2 */}
        <span className="relative inline-block font-extrabold" style={{ color: ai }}>
          I
          <svg viewBox="0 0 12 12" width={sz(10)} height={sz(10)} className="absolute" style={{ top: sz(-5), left: sz(1), pointerEvents: "none" }} aria-hidden="true">
            <circle cx="6" cy="6" r="5" fill={bf} />
          </svg>
        </span>
        {/* Constellation lines connecting berry-o to I-dot to Labs-dot */}
        {scale >= 0.45 && (
          <svg viewBox="0 0 340 70" width={sz(340)} height={sz(70)} className="absolute" style={{ top: sz(-8), left: sz(0), pointerEvents: "none", opacity: 0.12 }} aria-hidden="true">
            {/* Line: berry-o node → I-dot node */}
            <line x1="40" y1="50" x2="310" y2="10" stroke={txt} strokeWidth="1.2" />
            {/* Line: I-dot → Labs dot position (below) */}
            <line x1="310" y1="10" x2="80" y2="65" stroke={txt} strokeWidth="1" />
            {/* Line: Labs dot → berry-o (triangle) */}
            <line x1="80" y1="65" x2="40" y2="50" stroke={txt} strokeWidth="1" />
          </svg>
        )}
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(4) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        {/* Node 3 — completes the constellation triangle */}
        <svg viewBox="0 0 8 8" width={sz(7)} height={sz(7)} aria-hidden="true"><circle cx="4" cy="4" r="3.5" fill={bf} opacity="0.7" /></svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Labs</span>
      </div>
    </div>
  );
}

/** V17: "The Beaker b"
 *  Technique: #3 Letterform Modification (on "b" in Labs) + #4 Tittle Replacement
 *  Most subtle concept: the "b" in "Labs" is subtly widened at the bottom
 *  to suggest a beaker/flask silhouette. "o" = berry. I-dot = accent node.
 *  Clues: o = berry | AI = TBI color | b-in-Labs = beaker silhouette
 *  Elements: 4 */
function WordmarkBeakerB({ scale = 1, mode = "dark", color = "tbi" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const ai = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  const fs = sz(48);
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }} role="img" aria-label="ColaberryAI Research Labs">
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: fs }}>
        <span className="font-semibold" style={{ color: txt }}>C</span>
        {/* Berry "o" */}
        <span className="inline-block relative" style={{ width: sz(26), height: fs, verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 26 48" width={sz(26)} height={fs} style={{ pointerEvents: "none" }}>
            <circle cx="13" cy="31" r="10.5" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            {scale >= 0.4 && <path d="M13,20.5 C13.5,16 14.5,13 16,10" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
            {/* Leaves — large filled shapes unmistakably berry-like */}
            {scale >= 0.5 && <>
              <path d="M14.5,11.5 C12,9 9.5,10.5 11.5,13.5 C12.5,14.5 14,13.5 14.5,11.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
              <path d="M16,10.5 C18.5,7.5 21,9 19.5,12 C18.5,13.5 16.5,12.5 16,10.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            </>}
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt }}>laberry</span>
        <span className="font-extrabold" style={{ color: ai }}>AI</span>
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(4) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        <svg viewBox="0 0 6 6" width={sz(5)} height={sz(5)} aria-hidden="true"><circle cx="3" cy="3" r="3" fill={bf} opacity="0.6" /></svg>
        {/* "Labs" with beaker-b: the "b" letterform is a custom SVG */}
        <span className="inline-flex items-center" style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }}>
          <span className="uppercase font-medium">LA</span>
          {/* Custom "b" shaped like a beaker — wider at bottom */}
          <span className="inline-block relative" style={{ width: sz(8), height: sz(14) }} aria-hidden="true">
            <svg viewBox="0 0 10 16" width={sz(8)} height={sz(14)} style={{ pointerEvents: "none" }}>
              {/* Stem (neck of beaker) */}
              <rect x="2" y="0" width="2.5" height="8" fill={C.gray} />
              {/* Bowl (flask body — wider at bottom) */}
              <path d="M1,8 L1,14 Q1,16 3,16 L8,16 Q10,16 10,14 L10,8 Z" fill={C.gray} />
              {/* Liquid level hint */}
              {scale >= 0.6 && <path d="M2,12 L9,12 L9.5,14 Q9.5,15.5 8,15.5 L3,15.5 Q1.5,15.5 1.5,14 Z" fill={bf} opacity="0.3" />}
            </svg>
          </span>
          <span className="uppercase font-medium">S</span>
        </span>
      </div>
    </div>
  );
}

/** V18: "The Hanging Berry"
 *  Technique: #10 Baseline Disruption + #11 Scale Variation
 *  The "o" drops 3px below the baseline — like a berry hanging from a branch.
 *  The "C" acts as the branch. "AI" is slightly larger (scale variation) for emphasis.
 *  Ultra-clean: only 3 SVG elements.
 *  Clues: o = hanging berry | C = branch | AI = scale emphasis = important
 *  Elements: 3 */
function WordmarkHangingBerry({ scale = 1, mode = "dark", color = "tbi" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const ai = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  const fs = sz(48);
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }} role="img" aria-label="ColaberryAI Research Labs">
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: fs }}>
        <span className="font-semibold" style={{ color: txt }}>C</span>
        {/* Berry "o" — dropped below baseline like a hanging berry */}
        <span className="inline-block relative" style={{ width: sz(26), height: sz(56), verticalAlign: "baseline" }} aria-hidden="true">
          <svg viewBox="0 0 26 56" width={sz(26)} height={sz(56)} style={{ pointerEvents: "none" }}>
            {/* Stem connecting C to berry — the branch */}
            {scale >= 0.4 && <line x1="5" y1="28" x2="13" y2="33" stroke={txt} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />}
            {/* Berry dropped below baseline */}
            <circle cx="13" cy="38" r="10.5" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            {scale >= 0.45 && <path d="M13,27.5 C13.5,23 14.5,20 16,17" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />}
            {/* Leaves — large filled shapes unmistakably berry-like */}
            {scale >= 0.5 && <>
              <path d="M14.5,18.5 C12,16 9.5,17.5 11.5,20.5 C12.5,21.5 14,20.5 14.5,18.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
              <path d="M16,17.5 C18.5,14.5 21,16 19.5,19 C18.5,20.5 16.5,19.5 16,17.5Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            </>}
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt, position: "relative", top: sz(0) }}>laberry</span>
        {/* AI slightly larger — scale variation technique */}
        <span className="font-extrabold" style={{ color: ai, fontSize: sz(52) }}>AI</span>
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(6) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        <svg viewBox="0 0 6 6" width={sz(5)} height={sz(5)} aria-hidden="true"><circle cx="3" cy="3" r="3" fill={bf} opacity="0.6" /></svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Labs</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEGACY MARKS (V9–V10 Bracket system)
   ══════════════════════════════════════════════════════════════════ */

type MarkComponent = React.ComponentType<{ size?: number; mode?: "dark" | "light"; color?: ColorScheme }>;

function MarkBracketDot({ size = 56, mode = "dark", color = "coral" as ColorScheme }: { size?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const fg = mode === "dark" ? C.white : C.dark;
  const accent = accentColor(color, mode);
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="none" aria-hidden="true">
      <rect x="2" y="2" width="7" height="52" fill={fg} />
      <rect x="2" y="2" width="52" height="7" fill={fg} />
      <rect x="2" y="47" width="52" height="7" fill={fg} />
      <circle cx="30" cy="28" r="10" fill={accent} />
    </svg>
  );
}

function MarkBracketB({ size = 56, mode = "dark", color = "coral" as ColorScheme }: { size?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const fg = mode === "dark" ? C.white : C.dark;
  const accent = accentColor(color, mode);
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="none" aria-hidden="true">
      <rect x="2" y="2" width="7" height="52" fill={fg} />
      <rect x="2" y="2" width="46" height="7" fill={fg} />
      <rect x="2" y="47" width="46" height="7" fill={fg} />
      <rect x="20" y="13" width="7" height="30" fill={fg} />
      <rect x="20" y="13" width="26" height="7" rx="2" fill={fg} />
      <rect x="20" y="36" width="26" height="7" rx="2" fill={fg} />
      <rect x="46" y="13" width="7" height="13" rx="2" fill={fg} />
      <rect x="46" y="30" width="7" height="13" rx="2" fill={fg} />
      <rect x="27" y="23" width="22" height="8" rx="1" fill={accent} />
    </svg>
  );
}

/** Mark 3 / V19: "Pixel Berry" — MIT Media Lab-inspired grid mark
 *  C-shape made of geometric blocks with berry circle in the counter.
 *  Bold, modular, abstract. Berry in C's counter = Colaberry visual clue.
 *  Elements: 4 (C-blocks, berry circle, stem, leaf hint) */
function MarkPixelBerry({ size = 56, mode = "dark", color = "tbi" as ColorScheme }: { size?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const fg = mode === "dark" ? C.white : C.dark;
  const accent = accentColor(color, mode);
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="none" aria-hidden="true">
      {/* C-shape: top bar */}
      <rect x="2" y="2" width="42" height="8" fill={fg} />
      {/* C-shape: left stem */}
      <rect x="2" y="2" width="8" height="52" fill={fg} />
      {/* C-shape: bottom bar */}
      <rect x="2" y="46" width="42" height="8" fill={fg} />
      {/* Berry circle in C's counter */}
      <circle cx="32" cy="28" r="10" fill={accent} />
      {/* Stem — tall curved stem like original Colaberry cherry logo */}
      <path d="M32,18 C32.5,13 33.5,10 35,7" stroke={fg} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Leaves — large filled shapes unmistakably berry-like */}
      <path d="M33.5,8.5 C31,6 28.5,7.5 30.5,10.5 C31.5,11.5 33,10.5 33.5,8.5Z" fill={fg} opacity="0.75" stroke={fg} strokeWidth="1.1" />
      <path d="M35,7.5 C37.5,4.5 40,6 38.5,9 C37.5,10.5 35.5,9.5 35,7.5Z" fill={fg} opacity="0.75" stroke={fg} strokeWidth="1.1" />
    </svg>
  );
}

/** Mark 4 / V20: "Neural Grid" — MIT Media Lab-inspired grid mark
 *  Abstract "AI" letterforms in bold geometric blocks.
 *  A = triangle from rectangles, I = single column with berry-dot tittle.
 *  Knowledge graph lines subtly connect elements.
 *  Elements: 6 (A-blocks, I-stem, berry-dot, crossbar, grid dots, connecting lines) */
function MarkNeuralGrid({ size = 56, mode = "dark", color = "tbi" as ColorScheme }: { size?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const fg = mode === "dark" ? C.white : C.dark;
  const accent = accentColor(color, mode);
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="none" aria-hidden="true">
      {/* A: left leg */}
      <rect x="4" y="14" width="8" height="38" fill={fg} />
      {/* A: right leg */}
      <rect x="20" y="14" width="8" height="38" fill={fg} />
      {/* A: crossbar (accent) */}
      <rect x="4" y="30" width="24" height="7" fill={accent} />
      {/* A: apex cap */}
      <rect x="8" y="6" width="16" height="8" fill={fg} />
      {/* I: stem */}
      <rect x="38" y="14" width="8" height="38" fill={fg} />
      {/* I: berry-dot tittle */}
      <circle cx="42" cy="6" r="5" fill={accent} />
      {/* Knowledge graph connecting line */}
      <line x1="16" y1="6" x2="42" y2="6" stroke={accent} strokeWidth="1" opacity="0.2" />
      {/* Grid reference dots */}
      <circle cx="54" cy="2" r="1.5" fill={fg} opacity="0.15" />
      <circle cx="54" cy="54" r="1.5" fill={fg} opacity="0.15" />
      <circle cx="2" cy="54" r="1.5" fill={fg} opacity="0.15" />
    </svg>
  );
}

function BracketLockup({ Mark, mode = "dark", markSize = 48, color = "coral" }: { Mark: MarkComponent; mode?: "dark" | "light"; markSize?: number; color?: ColorScheme }) {
  return (
    <div className="flex items-center gap-3">
      <Mark size={markSize} mode={mode} color={color} />
      <div className="border-l pl-3" style={{ borderColor: mode === "dark" ? "#3F3F46" : "#E4E4E7" }}>
        <div style={{ fontFamily: FONT }} className="leading-none tracking-[-0.03em]">
          <span style={{ color: mode === "dark" ? C.white : C.black, fontSize: markSize * 0.5 }} className="font-semibold">Colaberry</span>
          <span style={{ color: wordmarkAI(color, mode), fontSize: markSize * 0.5 }} className="font-extrabold">AI</span>
        </div>
        <p style={{ color: C.gray, fontSize: markSize * 0.2 }} className="mt-1 tracking-[0.15em] uppercase font-medium">Research Labs</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LEGACY WORDMARKS (V1–V8)
   ══════════════════════════════════════════════════════════════════ */

function WordmarkBerryMolecule({ scale = 1, mode = "dark", color = "coral" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const accent = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }}>
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: sz(48) }}>
        <span className="font-semibold" style={{ color: txt }}>C</span>
        <span className="inline-block relative" style={{ width: sz(30), height: sz(48), verticalAlign: "top" }}>
          <svg viewBox="0 0 30 48" width={sz(30)} height={sz(48)} className="absolute inset-0">
            <circle cx="15" cy="30" r="11" fill={bf} />
            {/* Stem — tall curved stem like original Colaberry cherry logo */}
            <path d="M15,19 C15.5,14.5 16.5,11.5 18,8.5" stroke={txt} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Leaves — large filled shapes unmistakably berry-like */}
            <path d="M16.5,10 C14,7.5 11.5,9 13.5,12 C14.5,13 16,12 16.5,10Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            <path d="M18,9 C20.5,6 23,7.5 21.5,10.5 C20.5,12 19,11 18,9Z" fill={txt} opacity="0.75" stroke={txt} strokeWidth="1" />
            <line x1="26" y1="30" x2="30" y2="30" stroke={txt} strokeWidth="1.5" opacity="0.3" />
          </svg>
        </span>
        <span className="font-semibold" style={{ color: txt }}>laberry</span>
        <span className="relative font-extrabold" style={{ color: accent }}>
          A
          <span className="relative inline-block">
            I
            <svg viewBox="0 0 12 12" width={sz(10)} height={sz(10)} className="absolute" style={{ top: sz(-6), left: sz(1) }}>
              <circle cx="6" cy="6" r="5" fill={bf} />
            </svg>
          </span>
        </span>
        <svg viewBox="0 0 100 10" width={sz(100)} height={sz(6)} className="absolute" style={{ bottom: sz(14), right: sz(30), opacity: 0.15 }}>
          <line x1="0" y1="5" x2="100" y2="5" stroke={txt} strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5" style={{ marginTop: sz(4) }}>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research</span>
        <svg viewBox="0 0 6 6" width={sz(5)} height={sz(5)}><circle cx="3" cy="3" r="3" fill={bf} opacity="0.5" /></svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Labs</span>
      </div>
    </div>
  );
}

function WordmarkBerryLattice({ scale = 1, mode = "dark", color = "coral" as ColorScheme }: { scale?: number; mode?: "dark" | "light"; color?: ColorScheme }) {
  const txt = wordmarkTxt(color, mode);
  const accent = wordmarkAI(color, mode);
  const bf = berryColor(color, mode);
  const sz = (v: number) => v * scale;
  return (
    <div className="inline-flex flex-col items-start" style={{ fontFamily: FONT }}>
      <div className="relative leading-none tracking-[-0.03em]" style={{ fontSize: sz(48) }}>
        <svg viewBox="0 0 340 60" width={sz(340)} height={sz(60)} fill="none" className="absolute inset-0" style={{ top: sz(-4) }}>
          <path d="M20 10 L50 30 L20 50 M50 30 L80 10 L110 30 L80 50 L50 30 M110 30 L140 10 L170 30 L140 50 L110 30 M170 30 L200 10 L230 30 L200 50 L170 30 M230 30 L260 10 L290 30 L260 50 L230 30" stroke={txt} strokeWidth="1" opacity="0.08" />
          <circle cx="20" cy="10" r="5" fill={bf} opacity="0.4" />
          <circle cx="80" cy="10" r="4" fill={bf} opacity="0.3" />
          <circle cx="170" cy="30" r="6" fill={bf} opacity="0.35" />
          <circle cx="260" cy="10" r="5" fill={bf} opacity="0.45" />
          <circle cx="290" cy="30" r="4.5" fill={bf} opacity="0.3" />
          <circle cx="140" cy="50" r="4" fill={bf} opacity="0.25" />
        </svg>
        <span className="relative font-semibold" style={{ color: txt }}>Colaberry</span>
        <span className="relative font-extrabold" style={{ color: accent }}>AI</span>
      </div>
      <div className="flex items-center gap-2" style={{ marginTop: sz(6) }}>
        <svg viewBox="0 0 16 16" width={sz(14)} height={sz(14)} fill="none">
          <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" stroke={txt} strokeWidth="1.2" opacity="0.3" />
          <circle cx="8" cy="8" r="3.5" fill={bf} opacity="0.6" />
        </svg>
        <span style={{ color: C.gray, fontSize: sz(11), letterSpacing: "0.2em" }} className="uppercase font-medium">Research Labs</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════════ */

type WordmarkComponent = React.ComponentType<{ scale?: number; mode?: "dark" | "light"; color?: ColorScheme }>;

/* V13 — Agent-Generated (Subconscious Visual Clue Framework) */
const v13Logos: { id: string; name: string; elements: number; technique: string; clues: string; Wordmark: WordmarkComponent }[] = [
  { id: "V11", name: "The C-Berry Cradle", elements: 5, technique: "Letterform Mod + Color Isolation", clues: "C cradles berry-o (heritage) | AI in TBI blue | Labs dot = atom ring", Wordmark: WordmarkCBerryCradle },
  { id: "V12", name: "The Signal Mind", elements: 7, technique: "Crossbar Sub + Counter Shape + Tittle Replace", clues: "o = berry | A-crossbar = EEG wave + eye in counter | I-dot = neural pulse ring", Wordmark: WordmarkSignalMind },
  { id: "V13", name: "The Ligature Flow", elements: 5, technique: "Ligature Creation", clues: "o = berry | AI joined as flowing intelligence stroke | I-dot = berry node", Wordmark: WordmarkLigatureFlow },
  { id: "V14", name: "The Eye of Intelligence", elements: 5, technique: "Counter Shaping + Tittle Replace", clues: "o = berry | A-counter = watchful eye | I-dot = accent node", Wordmark: WordmarkEyeIntel },
  { id: "V15", name: "The Antenna Broadcast", elements: 6, technique: "Stem Extension + Tittle Replace", clues: "o = berry | I-tittle = broadcast arcs (AI signal) | clean A", Wordmark: WordmarkAntenna },
  { id: "V16", name: "The Constellation", elements: 6, technique: "Negative Space + Color Isolation", clues: "o = berry node | I-dot = node | Labs-dot = node | thin lines form knowledge graph triangle", Wordmark: WordmarkConstellation },
  { id: "V17", name: "The Beaker b", elements: 4, technique: "Letterform Mod (Labs 'b')", clues: "o = berry | AI = TBI blue | 'b' in Labs shaped like a beaker/flask", Wordmark: WordmarkBeakerB },
  { id: "V18", name: "The Hanging Berry", elements: 3, technique: "Baseline Disruption + Scale Variation", clues: "o drops below baseline = hanging berry | C = branch | AI = larger scale emphasis", Wordmark: WordmarkHangingBerry },
];

/* Legacy V1–V8 */
const legacyLogos: { id: string; name: string; desc: string; Wordmark: WordmarkComponent }[] = [
  { id: "V1", name: "Berry Molecule", desc: "Berry 'o' with stem + leaf, I-tittle berry dot, dashed molecule bond line", Wordmark: WordmarkBerryMolecule },
  { id: "V2", name: "Berry Lattice", desc: "Diamond lattice grid overlay behind wordmark, hexagon berry icon for Labs", Wordmark: WordmarkBerryLattice },
];

const bracketMarks: { id: string; name: string; desc: string; Mark: MarkComponent }[] = [
  { id: "V9", name: "Bracket Dot [·]", desc: "Square bracket frame with centered berry dot — standalone mark for favicons/avatars", Mark: MarkBracketDot },
  { id: "V10", name: "Bracket B [B]", desc: "Square bracket frame containing letter B for Berry — standalone mark with accent bar", Mark: MarkBracketB },
  { id: "V19", name: "Pixel Berry (MIT-style)", desc: "MIT Media Lab-inspired grid mark — geometric C-shape blocks with berry circle in counter. Bold, modular, abstract.", Mark: MarkPixelBerry },
  { id: "V20", name: "Neural Grid (MIT-style)", desc: "MIT Media Lab-inspired grid mark — abstract AI letterforms in geometric blocks with berry-dot tittle and knowledge graph lines.", Mark: MarkNeuralGrid },
];

/* ══════════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════════ */

export default function BrandPreview() {
  return (
    <>
      <Head><title>ColaberryAI Research Labs — Logo Specification V60</title></Head>

      <div className="min-h-screen bg-white px-8 py-12">
        <div className="mx-auto max-w-7xl space-y-16">

          {/* ── Title ── */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-zinc-900">ColaberryAI Research Labs — Logo Specification</h1>
            <p className="text-zinc-500 text-base max-w-3xl mx-auto">
              Enterprise wordmark for sales teams. Must hold its own next to Microsoft, AWS, and Google Cloud in partnership slides. Spec from competitive audit of IBM Research, Palantir, and MIT Media Lab identity systems.
            </p>
            <p className="text-zinc-400 text-xs">
              Source: ChatGPT Deep Research Brief &middot; Full spec: <code className="bg-zinc-100 px-1 py-0.5 rounded">/public/brand/DESIGN-BRIEF-V60.md</code>
            </p>
          </div>

          {/* ── Reference Logos ── */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">Reference Logos — The Quality Standard</h2>
            <p className="text-zinc-500 text-base max-w-3xl">
              The new logo must evolve from these existing professionally-designed logos. The C+o berry letterform is the brand&apos;s DNA.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">colaberry.ai — Current Site</h3>
                <div className="flex justify-center items-center py-6 rounded-xl bg-white border border-zinc-100">
                  <img src="/brand/colaberry-ai-logo.png" alt="colaberry.ai logo" className="h-12 w-auto" />
                </div>
                <p className="text-xs text-zinc-500">C = large open circle (berry). o = smaller circle (berry). Connected by stem + leaf. Steel blue #357895.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">ColaberryAI — With AI</h3>
                <div className="flex justify-center items-center py-6 rounded-xl bg-white border border-zinc-100">
                  <img src="/brand/colaberry-ai-logo-2.png" alt="ColaberryAI logo" className="h-12 w-auto" />
                </div>
                <p className="text-xs text-zinc-500">Same berry C+o mark. &quot;AI&quot; in black bold caps. This is the format to evolve.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">Research Labs — Old Site</h3>
                <div className="flex justify-center items-center py-6 rounded-xl bg-white border border-zinc-100">
                  <img src="/brand/colaberry-ai-research-labs-old-site.png" alt="Research Labs logo" className="h-12 w-auto" />
                </div>
                <p className="text-xs text-zinc-500">Clean typography. &quot;Ai&quot; in teal. Signal wave bars flanking &quot;Research Labs&quot;. The subtitle style to adopt.</p>
              </div>
            </div>
          </div>

          {/* ── Design Specification ── */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">Design Specification</h2>
            <p className="text-zinc-500 text-sm max-w-3xl">From ChatGPT Deep Research brief. Full spec: <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">/public/brand/DESIGN-BRIEF-V60.md</code></p>

            {/* Color System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">Color System — Strict Heritage</h3>
                <div className="space-y-3">
                  {[
                    { color: "#357895", name: "Primary (Steel Blue)", usage: "Berry shapes, stem, leaf, 'laberry', 'AI'", contrast: "4.9:1 WCAG AA" },
                    { color: "#52525B", name: "Subtitle", usage: "'RESEARCH LABS'", contrast: "7.7:1 WCAG AAA" },
                    { color: "#E4E4E7", name: "Divider", usage: "Decorative rule only", contrast: "Decorative" },
                  ].map(({ color, name, usage, contrast }) => (
                    <div key={color} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: color, border: color === "#E4E4E7" ? "1px solid #D4D4D8" : "none" }} />
                      <div>
                        <p className="text-xs font-semibold text-zinc-700"><span className="font-mono">{color}</span> {name}</p>
                        <p className="text-xs text-zinc-500">{usage} &middot; {contrast}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-100">Optional refined palette: <span className="font-mono">#2F6F8F</span> primary / <span className="font-mono">#1F4E67</span> dark accent for &quot;research institute&quot; feel.</p>
              </div>

              {/* Typography */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">Typography Spec</h3>
                <div className="space-y-2">
                  {[
                    { element: '"laberry"', weight: "400-500 (Regular/Medium)", tracking: "-1% to 0%", color: "#357895" },
                    { element: '"AI"', weight: "650-700 (SemiBold/Bold)", tracking: "-2% to -4%", color: "#357895" },
                    { element: '"RESEARCH LABS"', weight: "300-400 (Light/Regular)", tracking: "+120 to +180", color: "#52525B" },
                  ].map(({ element, weight, tracking, color }) => (
                    <div key={element} className="flex items-center gap-3 py-1.5 border-b border-zinc-50 last:border-0">
                      <span className="text-xs font-mono font-semibold w-32 shrink-0" style={{ color }}>{element}</span>
                      <span className="text-xs text-zinc-500">{weight} &middot; tracking {tracking}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-100">Typefaces: Inter (default), Suisse Int&apos;l (premium), Helvetica Now (tiny sizes). Tighten yA junction by 10-25 units.</p>
              </div>

              {/* Berry Geometry */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">Berry Geometry (Parametric)</h3>
                <p className="text-xs text-zinc-500">X = x-height of &quot;laberry&quot; &middot; S = 0.12X (stroke) &middot; G = 0.18X (gap)</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-zinc-50">
                    <span className="font-semibold text-zinc-700">C-berry (open ring)</span>
                    <span className="text-zinc-500">dia 2.05X &middot; stroke S &middot; opening 40-48&deg;</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-50">
                    <span className="font-semibold text-zinc-700">o-berry (closed ring)</span>
                    <span className="text-zinc-500">dia 1.00X &middot; stroke S &middot; offset +0.82X right, +0.11X down</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-50">
                    <span className="font-semibold text-zinc-700">Stem</span>
                    <span className="text-zinc-500">stroke 0.60S &middot; single Bezier &middot; optional 2 micro-tapers</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="font-semibold text-zinc-700">Leaf</span>
                    <span className="text-zinc-500">teardrop 0.55X &times; 0.32X &middot; rotate 20-30&deg;</span>
                  </div>
                </div>
              </div>

              {/* Subconscious Cues */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">Subconscious Cues (Non-AI-ish)</h3>
                <div className="space-y-2 text-xs text-zinc-500">
                  <div className="flex gap-2 items-start">
                    <span className="font-semibold text-zinc-700 shrink-0">AI:</span>
                    <span>Weight contrast on &quot;AI&quot; — heavier = importance signal. No symbols needed.</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="font-semibold text-zinc-700 shrink-0">Signal:</span>
                    <span>Stem refined into engineered Bezier (geometric tension, not playful botanical). Optional micro-tapers.</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="font-semibold text-zinc-700 shrink-0">Research:</span>
                    <span>Tracked-out subtitle + strict alignment = institutional rigor. Structure communicates &quot;lab&quot;, not icons.</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-100">Pattern from: IBM Research, Microsoft Research, Palantir, MIT Media Lab (Pentagram).</p>
              </div>
            </div>
          </div>

          {/* Live Rendered Preview moved to Geometric Sketch section under TOP PICK */}

          {/* ── Four Variations ── */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">Four Lockup Variations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { num: "1", name: "Direct Evolution", goal: "Maximum brand continuity", spec: "Berry 'Co' matches current asset exactly. 'AI' bold weight only. Subtitle centered or aligned with 'l' of 'laberry'. Strict heritage palette.", deploy: "Sales decks, proposal headers, partner slides", tag: "DEFAULT" },
                { num: "2", name: "With Signal Waves", goal: "Add technical cue, stay enterprise-clean", spec: "Same as #1 + micro signal bars flanking subtitle (4 bars/side, heights 3/6/9/6 px, steel blue). Optional thin #E4E4E7 divider behind subtitle.", deploy: "Tech-forward slide sections", tag: "TECH" },
                { num: "3", name: "Refined Geometry", goal: "'40 hours of optical polish'", spec: "Tighten C/o spacing by ~0.04X. Stem Bezier more engineered. Leaf simplified. 'AI' kerning tightened. Optional refined palette (#2F6F8F).", deploy: "Premium brand touchpoints", tag: "PREMIUM" },
                { num: "4", name: "Stacked Layout", goal: "Narrow-width contexts", spec: "Line 1: ColaberryAI. Line 2: RESEARCH LABS at 0.55-0.65 of main x-height. Left-aligned block. Tracking slightly reduced.", deploy: "LinkedIn banners, app headers, sidebars", tag: "NARROW" },
              ].map(({ num, name, goal, spec, deploy, tag }) => (
                <div key={num} className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400">#{num}</span>
                    <h3 className="text-sm font-bold text-zinc-900">{name}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{tag}</span>
                  </div>
                  <p className="text-xs text-zinc-700 font-medium">{goal}</p>
                  <p className="text-xs text-zinc-500">{spec}</p>
                  <p className="text-xs text-zinc-400">Deploy: {deploy}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Deliverables & Sizing ── */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">Deliverables &amp; Sizing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3">
                <h3 className="text-sm font-bold text-zinc-900">Export Formats</h3>
                <ul className="text-xs text-zinc-500 space-y-1 list-disc pl-4">
                  <li>SVG (primary master)</li>
                  <li>PDF (vector, print-friendly)</li>
                  <li>PNG transparent (1x / 2x / 4x)</li>
                  <li>Monochrome set (all-blue, all-black, all-white)</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3">
                <h3 className="text-sm font-bold text-zinc-900">Sizing Rules</h3>
                <ul className="text-xs text-zinc-500 space-y-1 list-disc pl-4">
                  <li>Clear space: min 1.0X, preferred 1.5X</li>
                  <li>Min size: stem &ge; 1px at export</li>
                  <li>Small lockup: drop subtitle under ~200px width</li>
                  <li>Left-aligned default; centered for marketing only</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3">
                <h3 className="text-sm font-bold text-zinc-900">Competitive Alignment</h3>
                <ul className="text-xs text-zinc-500 space-y-1 list-disc pl-4">
                  <li>IBM Research: parent mark + descriptor</li>
                  <li>Microsoft Research: brand architecture</li>
                  <li>Palantir: strict composition + clear space</li>
                  <li>MIT Media Lab: grid system, no literal icons</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Professional Logo Candidates ── */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900">Professional Logo Candidates</h2>
              <p className="text-zinc-500 text-sm max-w-3xl">
                AI-generated candidates from ChatGPT / Gemini for review. Files in <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">public/brand/candidates/final/</code>
              </p>
            </div>

            {/* ── HERO: Signal Waves (Primary Candidate) ── */}
            <div className="rounded-2xl border-2 border-zinc-900 bg-white p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-900 text-white">TOP PICK</span>
                <h3 className="text-lg font-bold text-zinc-900">V60 — Signal Waves (ChatGPT)</h3>
              </div>
              <p className="text-sm text-zinc-500 max-w-3xl">
                Matches Brief Variation #2: &quot;With Signal Waves.&quot; C-berry open ring + o-berry closed ring + stem/leaf. &quot;AI&quot; heavier weight. &quot;RESEARCH LABS&quot; all caps with signal bars flanking. Steel blue monochrome. Enterprise-clean.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-center items-center py-10 rounded-xl bg-white border border-zinc-100">
                  <img src="/brand/candidates/final/v60-chatgpt-signal-waves.png" alt="V60 Signal Waves — light" className="max-h-48 w-auto" />
                </div>
                <div className="flex justify-center items-center py-10 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img src="/brand/candidates/final/v60-chatgpt-signal-waves.png" alt="V60 Signal Waves — dark bg" className="max-h-48 w-auto" />
                </div>
              </div>
              <div className="text-xs text-zinc-400 space-y-1">
                <p><strong>Brief alignment:</strong> C-berry (open ring) + o-berry (closed) + stem/leaf + &quot;AI&quot; weight contrast + signal bars + tracked subtitle</p>
                <p><strong>Refinements needed:</strong> Leaf could be simpler teardrop. AI kerning tighter (-2% to -4%). o-berry slightly oversized vs brief spec (1.00X vs 2.05X ratio).</p>
                <p><strong>Deploy:</strong> Sales decks, pitch slides, proposal headers, business cards</p>
              </div>
            </div>

            {/* ── Annotated Breakdown — Visual Cues ── */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">Annotated Breakdown — Embedded Visual Cues</h3>
                <p className="text-xs text-zinc-500">
                  Per Karun&apos;s brief: &quot;In our original colaberry.com logo, the C and o are part of a berry — this leaves visual clues in people&apos;s subconscious mind.
                  Similar approach: visual indication of AI and Research Labs, not just text.&quot;
                </p>
              </div>

              {/* Large annotated render — light */}
              <div className="rounded-xl border border-zinc-100 bg-white py-10 px-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <img src="/brand/candidates/final/v60-chatgpt-signal-waves.png" alt="V60 Signal Waves — annotated" className="max-h-56 w-auto" />
                  </div>
                </div>
              </div>

              {/* Visual cue callouts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cue 1: Colaberry */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white" style={{ background: "#357895" }}>1</span>
                    <span className="text-sm font-bold text-zinc-900">Colaberry Heritage</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    <strong>C + o = berries on a branch.</strong> The large open &quot;C&quot; and small closed &quot;o&quot; are stylized berries connected by a botanical stem with leaf — reads as a berry cluster at first glance, then as &quot;Co&quot; letterforms on second look. Dual-reading creates the &quot;aha&quot; moment.
                  </p>
                </div>

                {/* Cue 2: AI */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white" style={{ background: "#357895" }}>2</span>
                    <span className="text-sm font-bold text-zinc-900">AI — Intelligence Cue</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    <strong>Neural nodes on the stem.</strong> The connecting branch has subtle dots along its path — at a glance they&apos;re berries on a twig, but on closer inspection they form a neural network pathway. The stem IS a data pipeline. Also: &quot;AI&quot; set in bold weight for typographic signal.
                  </p>
                </div>

                {/* Cue 3: Research Labs */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white" style={{ background: "#357895" }}>3</span>
                    <span className="text-sm font-bold text-zinc-900">Research Labs — Signal Cue</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    <strong>Signal wave bars flanking the subtitle.</strong> The ascending/descending bars echo data visualization, signal processing, and research instrumentation — reads as &quot;transmitting knowledge.&quot; Wide letter-spacing on &quot;RESEARCH LABS&quot; evokes academic rigor and precision.
                  </p>
                </div>
              </div>

              {/* Dark background variant */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 py-10 px-6">
                <div className="flex justify-center">
                  <img src="/brand/candidates/final/v60-chatgpt-signal-waves.png" alt="V60 Signal Waves — dark bg" className="max-h-48 w-auto" />
                </div>
              </div>

              {/* Summary — why this works */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 space-y-3">
                <h4 className="text-sm font-bold text-zinc-900">Why This Works (Karun&apos;s &quot;Wow Factor&quot; Principle)</h4>
                <div className="text-xs text-zinc-600 leading-relaxed space-y-2">
                  <p>
                    <strong>Layer 1 — First glance:</strong> Clean, enterprise wordmark. Professional enough for sales decks and pitch slides.
                  </p>
                  <p>
                    <strong>Layer 2 — Second look:</strong> &quot;Oh, the C and o are berries on a branch&quot; — the Colaberry heritage is right there, hidden in plain sight.
                  </p>
                  <p>
                    <strong>Layer 3 — Closer inspection:</strong> &quot;The stem has neural nodes (AI) and those signal bars are data waves (Research Labs)&quot; — every element carries meaning.
                  </p>
                  <p className="text-zinc-400 pt-1">
                    Three layers of meaning in one mark. Enterprise-clean at a glance, rewarding on closer inspection.
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-400">Spec: C-berry 2.05X open ring &middot; o-berry 1.00X closed ring &middot; neural stem with nodes &middot; leaf teardrop &middot; signal bars 3/6/9/6 px &middot; Inter font &middot; #357895 steel blue</p>
            </div>

            {/* ── Earlier ChatGPT Explorations ── */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-bold text-zinc-400">Earlier ChatGPT Explorations (not recommended)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">ChatGPT — Berry Flask</h3>
                <div className="flex justify-center items-center py-8 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img src="/brand/candidates/final/v60-chatgpt-berry-flask.png" alt="Berry Flask concept" className="max-h-40 w-auto" />
                </div>
                <p className="text-xs text-zinc-500">Berry + flask + neural network. Purple gradient. Violates &quot;no gradients, no purple&quot; rule.</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-400">NOT RECOMMENDED</span>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900">ChatGPT — AI Labs Mark</h3>
                <div className="flex justify-center items-center py-8 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img src="/brand/candidates/final/v60-chatgpt-ai-labs-mark.png" alt="AI Labs Mark concept" className="max-h-40 w-auto" />
                </div>
                <p className="text-xs text-zinc-500">C-berry as flask with circuits. Loses &quot;Co&quot; dual-reading. Missing full wordmark.</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-400">NOT RECOMMENDED</span>
              </div>
            </div>

            {/* ── Reference: Original Colaberry School Logo ── */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">Reference — Colaberry School (training.colaberry.com)</h3>
              <div className="flex justify-center items-center py-6 rounded-xl bg-white border border-zinc-100">
                <img src="/brand/candidates/final/colaberry-school-logo.png" alt="Colaberry School logo" className="h-12 w-auto" />
              </div>
              <p className="text-xs text-zinc-500">Original red glossy cherries replacing C and o. Heritage DNA — same dual-reading &quot;Co&quot; berry concept evolved into steel blue enterprise typography.</p>
            </div>

            {/* ── Upload more ── */}
            <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center space-y-2">
              <p className="text-zinc-400 text-sm">
                Add more candidates: drop PNG/SVG into <code className="text-xs bg-zinc-200 px-1 py-0.5 rounded">public/brand/candidates/final/</code>
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
             PREVIOUS CLAUDE-GENERATED CONCEPTS (for reference only)
             ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-10 pt-8 border-t border-zinc-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-400">
                Previous Claude-Generated Concepts <span className="text-xs font-medium px-3 py-1 rounded-full ml-2 bg-zinc-100 text-zinc-400">ARCHIVED</span>
              </h2>
              <p className="text-zinc-400 text-sm max-w-3xl">
                These SVG concepts explored the design direction but don&apos;t meet the professional quality bar for client-facing use. Kept for reference.
              </p>
            </div>

            {/* V50 — The Crowned Berry */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">V50 — The Crowned Berry</h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-2xl">C-calyx arc wraps a single premium cola berry with 3 calyx crown sepals at top (botanical authenticity — this is clearly a fruit, not a bomb). Internal S-curve divisions create brain hemisphere quadrants. Stem + leaf at apex. Coral spark = knowledge node. Steel blue dot = AI signal on C-arc.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex justify-center items-center py-8 rounded-xl border border-zinc-100 bg-white">
                  <img src="/brand/candidates/v50-crowned-berry-lockup.svg" alt="V50 light" className="h-16 w-auto" />
                </div>
                <div className="flex justify-center items-center py-8 rounded-xl bg-zinc-950">
                  <img src="/brand/candidates/v50-crowned-berry-lockup-dark.svg" alt="V50 dark" className="h-16 w-auto" />
                </div>
                <div className="flex justify-center items-center gap-6 py-8 rounded-xl border border-zinc-100 bg-zinc-50">
                  <div className="flex flex-col items-center gap-2">
                    <img src="/brand/candidates/v50-crowned-berry-mark.svg" alt="V50 mark 48px" className="h-12 w-12" />
                    <span className="text-xs text-zinc-400">48px</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img src="/brand/candidates/v50-crowned-berry-mark.svg" alt="V50 mark 32px" className="h-8 w-8" />
                    <span className="text-xs text-zinc-400">32px</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img src="/brand/candidates/v50-crowned-berry-mark.svg" alt="V50 mark 16px" className="h-4 w-4" />
                    <span className="text-xs text-zinc-400">16px</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#357895]/5 text-sm">
                <p className="font-semibold text-[#357895] mb-1">Discovery Sequence</p>
                <p className="text-zinc-600">0s: &quot;Premium botanical mark&quot; &rarr; 5s: &quot;It&apos;s a berry with a crown and leaf — the C is its calyx&quot; &rarr; 10s: &quot;The segments inside form brain hemispheres&quot; &rarr; 30s: &quot;Cola-berry = knowledge berry. The berry IS a brain.&quot;</p>
              </div>
            </div>

            {/* V51 and V52 side by side */}
            {[
              { id: "V51", name: "Berry Branch", desc: "Two cola berries on a C-shaped branch — parent and child. The branch IS the letter C. Large berry = the 'o'. Both have internal divisions. Dashed neural link between berries = AI network. Multiple berries = unmistakably fruit (solves 'bomb' problem).", light: "/brand/candidates/v51-berry-branch-lockup.svg", dark: "/brand/candidates/v51-berry-branch-lockup-dark.svg", mark: "/brand/candidates/v51-berry-branch-mark.svg", clues: "C-branch = Colaberry heritage | Two berries = clearly fruit, not projectile | Brain segments inside each | Neural dash between = AI connection | Leaf = botanical authenticity" },
              { id: "V52", name: "Orbital Berry", desc: "Single cola berry cradled by C-leaf with a tilted scientific orbit ring (atom = Research Labs). Two steel blue electron dots on the orbit = AI signal nodes. Berry has full botanical detail: stem, leaf, segments. Triple-clue: berry + brain + atom.", light: "/brand/candidates/v52-orbital-berry-lockup.svg", dark: "/brand/candidates/v52-orbital-berry-lockup-dark.svg", mark: "/brand/candidates/v52-orbital-berry-mark.svg", clues: "C-leaf = Colaberry | Berry segments = brain hemispheres = AI | Orbital ring = atom = Research Labs | Electron dots = intelligence nodes | Stem + leaf = botanical anchor" },
            ].map(({ id, name, desc, light, dark, mark, clues }) => (
              <div key={id} className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">{id} — {name}</h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-2xl">{desc}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex justify-center items-center py-8 rounded-xl border border-zinc-100 bg-white">
                    <img src={light} alt={`${id} light`} className="h-16 w-auto" />
                  </div>
                  <div className="flex justify-center items-center py-8 rounded-xl bg-zinc-950">
                    <img src={dark} alt={`${id} dark`} className="h-16 w-auto" />
                  </div>
                  <div className="flex justify-center items-center gap-6 py-8 rounded-xl border border-zinc-100 bg-zinc-50">
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 48px`} className="h-12 w-12" />
                      <span className="text-xs text-zinc-400">48px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 32px`} className="h-8 w-8" />
                      <span className="text-xs text-zinc-400">32px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 16px`} className="h-4 w-4" />
                      <span className="text-xs text-zinc-400">16px</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 text-sm">
                  <p className="font-semibold text-zinc-600 mb-1">Subconscious Clues</p>
                  <p className="text-zinc-500">{clues}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════════
             REFINED CONCEPTS — V32R, V34R, V41 Hybrid (Director-Selected)
             ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-10 pt-8 border-t border-zinc-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-400">
                V41 Director&apos;s Picks — Previous Round <span className="text-xs font-medium px-3 py-1 rounded-full ml-2 bg-zinc-100 text-zinc-400">PREVIOUS</span>
              </h2>
              <p className="text-zinc-500 text-base max-w-3xl">
                After scoring all 10 V31-V40 concepts, the Logo Design Director selected V32 and V34 for refinement and recommended a hybrid. These 3 refined concepts address all feedback: thicker strokes for favicon, tighter integration, and triple-read (berry + brain + science).
              </p>
            </div>

            {/* V41 Hybrid — THE STAR CONCEPT */}
            <div className="rounded-2xl border-2 border-[#357895] bg-white p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">V41 — The Hybrid (C-Leaf + Berry Brain) <span className="text-xs font-medium px-2 py-0.5 rounded-full ml-2 bg-[#357895]/10 text-[#357895]">RECOMMENDED</span></h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-2xl">C-leaf arc cradles a segmented berry-brain circle. Triple-read: C = leaf (Colaberry heritage), segmented circle = cola berry cross-section, internal divisions = brain hemispheres (AI). Coral spark = neural activation. Steel blue node = AI signal. 7 elements.</p>
                </div>
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-[#357895]/10 text-[#357895]">Target: 9/10</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex justify-center items-center py-8 rounded-xl border border-zinc-100 bg-white">
                  <img src="/brand/candidates/v41-hybrid-lockup.svg" alt="V41 Hybrid light" className="h-16 w-auto" />
                </div>
                <div className="flex justify-center items-center py-8 rounded-xl bg-zinc-950">
                  <img src="/brand/candidates/v41-hybrid-lockup-dark.svg" alt="V41 Hybrid dark" className="h-16 w-auto" />
                </div>
                <div className="flex justify-center items-center gap-6 py-8 rounded-xl border border-zinc-100 bg-zinc-50">
                  <div className="flex flex-col items-center gap-2">
                    <img src="/brand/candidates/v41-hybrid-mark.svg" alt="V41 mark 48px" className="h-12 w-12" />
                    <span className="text-xs text-zinc-400">48px</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img src="/brand/candidates/v41-hybrid-mark.svg" alt="V41 mark 32px" className="h-8 w-8" />
                    <span className="text-xs text-zinc-400">32px</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img src="/brand/candidates/v41-hybrid-mark.svg" alt="V41 mark 16px" className="h-4 w-4" />
                    <span className="text-xs text-zinc-400">16px</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#357895]/5 text-sm">
                <p className="font-semibold text-[#357895] mb-1">Discovery Sequence</p>
                <p className="text-zinc-600">0s: &quot;Premium tech logo&quot; &rarr; 5s: &quot;The C wraps around a berry&quot; &rarr; 10s: &quot;Wait, the segments look like brain hemispheres&quot; &rarr; 30s: &quot;Cola-berry literally means knowledge berry. The berry IS a brain.&quot;</p>
              </div>
            </div>

            {/* V32R and V34R side by side */}
            {[
              { id: "V32R", name: "Berry Brain (Refined)", score: "7.45 → 8.5+", desc: "Thicker internal divisions (2.2px), added calyx/stem nub at top, preserved S-curves. Now survives at favicon size.", light: "/brand/candidates/v32r-kola-brain-lockup.svg", dark: "/brand/candidates/v32r-kola-brain-lockup-dark.svg", mark: "/brand/candidates/v32r-kola-brain-mark.svg", markDark: "/brand/candidates/v32r-kola-brain-mark-dark.svg", clues: "Circle = cola berry cross-section | Divisions = brain hemispheres | Calyx = botanical anchor | Coral dot = neural spark" },
              { id: "V34R", name: "C-Leaf Berry (Refined)", score: "7.35 → 8.5+", desc: "C-leaf now overlaps berry (merged, not adjacent). Berry segmentation visible inside. Steel blue AI node + signal arc added.", light: "/brand/candidates/v34r-c-leaf-berry-lockup.svg", dark: "/brand/candidates/v34r-c-leaf-berry-lockup-dark.svg", mark: "/brand/candidates/v34r-c-leaf-berry-mark.svg", markDark: "/brand/candidates/v34r-c-leaf-berry-mark-dark.svg", clues: "C = leaf cupping berry | Berry interior = cola berry segments | Steel blue dot = AI node | Signal arc = broadcasting intelligence" },
            ].map(({ id, name, score, desc, light, dark, mark, markDark, clues }) => (
              <div key={id} className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{id} — {name}</h3>
                    <p className="text-sm text-zinc-500 mt-1 max-w-2xl">{desc}</p>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-700">{score}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex justify-center items-center py-8 rounded-xl border border-zinc-100 bg-white">
                    <img src={light} alt={`${id} light`} className="h-16 w-auto" />
                  </div>
                  <div className="flex justify-center items-center py-8 rounded-xl bg-zinc-950">
                    <img src={dark} alt={`${id} dark`} className="h-16 w-auto" />
                  </div>
                  <div className="flex justify-center items-center gap-6 py-8 rounded-xl border border-zinc-100 bg-zinc-50">
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 48px`} className="h-12 w-12" />
                      <span className="text-xs text-zinc-400">48px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 32px`} className="h-8 w-8" />
                      <span className="text-xs text-zinc-400">32px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 16px`} className="h-4 w-4" />
                      <span className="text-xs text-zinc-400">16px</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 text-sm">
                  <p className="font-semibold text-zinc-600 mb-1">Subconscious Clues</p>
                  <p className="text-zinc-500">{clues}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════════
             V31–V40 — INITIAL CONCEPTS (10 directions explored)
             ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-10 pt-8 border-t border-zinc-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-400">
                V31–V40 — Initial Concepts <span className="text-xs font-medium px-3 py-1 rounded-full ml-2 bg-zinc-100 text-zinc-400">SCORED</span>
              </h2>
              <p className="text-zinc-500 text-base max-w-3xl">
                Generated by multi-agent pipeline (Brand Strategist + Visual Metaphor Researcher + Canvas Designer + Logo Director). Based on cola berry research and competitive analysis of 20+ AI logos.
              </p>
            </div>

            {/* Top 4 Concepts — Side-by-side light/dark with marks */}
            {[
              { id: "V34", name: "The C-Leaf Berry", score: "8.7", desc: "C wraps around 'o' like a leaf cupping a berry. Heritage callback to original colaberry.com. Most ownable concept.", light: "/brand/candidates/v34-c-leaf-berry.svg", dark: "/brand/candidates/v34-c-leaf-berry-dark.svg", mark: "/brand/candidates/v34-c-leaf-berry-mark.svg", clues: "Co = C-leaf cups berry-o | AI = steel blue intelligence | Favicon = C+berry mark" },
              { id: "V39", name: "The Segmented O", score: "8.5", desc: "The 'o' has internal segmentation like a cola berry cross-section. Triple-read: letter 'o', berry cross-section, AND brain hemispheres.", light: "/brand/candidates/v39-segmented-o.svg", dark: "/brand/candidates/v39-segmented-o-dark.svg", mark: "/brand/candidates/v39-segmented-o-mark.svg", clues: "o = cola berry = brain hemispheres | AI = steel blue | Labs = cell division" },
              { id: "V31", name: "The Berry O", score: "8.5", desc: "Maximum restraint — only the 'o' is modified with micro-stem and leaf. Everything else clean Inter.", light: "/brand/candidates/v31-berry-o.svg", dark: "/brand/candidates/v31-berry-o-dark.svg", mark: "/brand/candidates/v31-berry-o-mark.svg", clues: "o = berry (stem + leaf) | AI = steel blue color isolation | Minimal, premium" },
              { id: "V32", name: "The Berry Brain", score: "8.3", desc: "Standalone mark: circle with internal segments = cola berry cross-section / brain hemispheres. No AI company has anything similar.", light: "/brand/candidates/v32-kola-brain-lockup.svg", dark: "/brand/candidates/v32-kola-brain-dark.svg", mark: "/brand/candidates/v32-kola-brain-mark.svg", clues: "Mark = cola berry = brain | Berry red spark = neural activation | Colaberry = knowledge berry" },
            ].map(({ id, name, score, desc, light, dark, mark, clues }) => (
              <div key={id} className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{id} — {name}</h3>
                    <p className="text-sm text-zinc-500 mt-1 max-w-2xl">{desc}</p>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-700">{score}/10</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* Light mode */}
                  <div className="flex justify-center items-center py-8 rounded-xl border border-zinc-100 bg-white">
                    <img src={light} alt={`${id} light`} className="h-16 w-auto" />
                  </div>
                  {/* Dark mode */}
                  <div className="flex justify-center items-center py-8 rounded-xl bg-zinc-950">
                    <img src={dark} alt={`${id} dark`} className="h-16 w-auto" />
                  </div>
                  {/* Favicon mark */}
                  <div className="flex justify-center items-center gap-6 py-8 rounded-xl border border-zinc-100 bg-zinc-50">
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 48px`} className="h-12 w-12" />
                      <span className="text-xs text-zinc-400">48px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 32px`} className="h-8 w-8" />
                      <span className="text-xs text-zinc-400">32px</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={mark} alt={`${id} mark 16px`} className="h-4 w-4" />
                      <span className="text-xs text-zinc-400">16px</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-zinc-50 text-sm">
                  <p className="font-semibold text-zinc-600 mb-1">Subconscious Clues</p>
                  <p className="text-zinc-500">{clues}</p>
                </div>
              </div>
            ))}

            {/* Remaining 6 concepts — compact cards */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { id: "V33", name: "The Signal A", score: "8.1", light: "/brand/candidates/v33-signal-a.svg", dark: "/brand/candidates/v33-signal-a-dark.svg", mark: "/brand/candidates/v33-signal-a-mark.svg", desc: "A's crossbar = sine wave signal. Berry 'o' + signal A = organic intelligence." },
                { id: "V35", name: "Berry Constellation", score: "7.8", light: "/brand/candidates/v35-berry-constellation.svg", dark: "/brand/candidates/v35-berry-constellation-dark.svg", mark: "/brand/candidates/v35-berry-constellation-mark.svg", desc: "3 berry-dots in triangular arrangement connected by graph edges." },
                { id: "V36", name: "Triple Embed", score: "7.8", light: "/brand/candidates/v36-triple-embed.svg", dark: "/brand/candidates/v36-triple-embed-dark.svg", mark: null, desc: "Berry 'o' + signal A-crossbar + beaker 'b'. Three clues in one wordmark." },
                { id: "V37", name: "Bracket Mark", score: "7.9", light: "/brand/candidates/v37-bracket-lockup.svg", dark: "/brand/candidates/v37-bracket-mark-dark.svg", mark: "/brand/candidates/v37-bracket-mark.svg", desc: "Square bracket framing a berry/node. Code-native: [berry] = contained knowledge." },
                { id: "V38", name: "Growth Branch", score: "6.9", light: "/brand/candidates/v38-growth-branch.svg", dark: "/brand/candidates/v38-growth-branch-dark.svg", mark: "/brand/candidates/v38-growth-branch-mark.svg", desc: "Minimalist branch with berries. Knowledge growing organically." },
                { id: "V40", name: "Orbital Berry", score: "7.5", light: "/brand/candidates/v40-orbital-berry.svg", dark: "/brand/candidates/v40-orbital-berry-dark.svg", mark: "/brand/candidates/v40-orbital-berry-mark.svg", desc: "Berry with elliptical orbit ring = atom + knowledge + science." },
              ].map(({ id, name, score, light, dark, mark, desc }) => (
                <div key={id} className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">{id} — {name}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{desc}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{score}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex justify-center items-center py-5 rounded-lg border border-zinc-100 bg-white">
                      <img src={light} alt={`${id} light`} className="h-10 w-auto" />
                    </div>
                    <div className="flex justify-center items-center py-5 rounded-lg bg-zinc-950">
                      <img src={dark} alt={`${id} dark`} className="h-10 w-auto" />
                    </div>
                    {mark ? (
                      <div className="flex justify-center items-center gap-3 py-5 rounded-lg border border-zinc-100 bg-zinc-50">
                        <img src={mark} alt={`${id} mark`} className="h-8 w-8" />
                        <img src={mark} alt={`${id} mark sm`} className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center py-5 rounded-lg border border-zinc-100 bg-zinc-50">
                        <span className="text-xs text-zinc-400">Wordmark only</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
             V21–V30 — PREVIOUS BERRY REDESIGN
             ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-10 pt-8 border-t border-zinc-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-400">
                V21–V30 — Berry Redesign <span className="text-xs font-medium px-3 py-1 rounded-full ml-2 bg-zinc-100 text-zinc-400">PREVIOUS</span>
              </h2>
              <p className="text-zinc-500 text-base max-w-3xl">
                Addressing &quot;bomb not berries&quot; feedback. Every mark now uses <strong className="text-zinc-700">multi-berry clusters</strong> (never a single sphere), <strong className="text-zinc-700">visible leaves and branches</strong>, and <strong className="text-zinc-700">geometric wordmark quality</strong> matching Aleem&apos;s Figma designs.
              </p>
            </div>

            {/* V29 — Geometric Wordmark (Aleem-quality) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-4 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-zinc-900">V29 — Geometric Wordmark + Signal Waves</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#357895]/10 text-[#357895] font-medium">Aleem-style</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">Clean enterprise wordmark with signal wave decorations on Research Labs — matches Aleem&apos;s Figma quality standard</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-center items-center py-10 rounded-xl border border-zinc-100 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/candidates/v29-geometric-wordmark.svg" alt="V29 Light" className="max-w-[420px] w-full" />
                </div>
                <div className="flex justify-center items-center py-10 rounded-xl bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/candidates/v29-geometric-wordmark-dark.svg" alt="V29 Dark" className="max-w-[420px] w-full" />
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex justify-center items-center py-4 px-6 rounded-xl border border-zinc-100 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/candidates/v29-co-mark.svg" alt="V29 Co Mark" className="w-12 h-12" />
                </div>
                <p className="text-xs text-zinc-400 self-center">&quot;Co&quot; monogram mark with berry detail — for favicon/app icon</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-3">
                <p className="text-xs text-zinc-500"><strong>Visual Clues:</strong> Clean geometric type = enterprise trust | Signal wave bars = AI/Research | Co mark has berry-in-O detail</p>
              </div>
            </div>

            {/* V30 — Berry Stem Wordmark */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-4 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-zinc-900">V30 — Berry Stem Wordmark</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium">Heritage callback</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">Like original colaberry.com: C+o junction has berry stem+leaves. Subtle, discoverable, professional.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-center items-center py-10 rounded-xl border border-zinc-100 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/candidates/v30-berry-wordmark.svg" alt="V30 Light" className="max-w-[420px] w-full" />
                </div>
                <div className="flex justify-center items-center py-10 rounded-xl bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/candidates/v30-berry-wordmark-dark.svg" alt="V30 Dark" className="max-w-[420px] w-full" />
                </div>
              </div>
              <div className="bg-zinc-50 rounded-lg p-3">
                <p className="text-xs text-zinc-500"><strong>Visual Clues:</strong> C+o junction = berry stem+leaves (heritage) | AI in steel blue = intelligence | Signal waves = Research Labs</p>
              </div>
            </div>

            {/* V21–V28 — Multi-agent berry concepts */}
            <div className="space-y-2 pt-4">
              <h3 className="text-xl font-bold text-zinc-900">V21–V28 — Multi-Agent Berry Cluster Concepts</h3>
              <p className="text-zinc-400 text-sm">SVG concepts from 3 parallel design agents. Each uses multi-berry clusters (never single sphere).</p>
            </div>

            {[
              { id: "V21", name: "Triple Berry Cluster", file: "v21-triple-berry-cluster", desc: "3 circles replace 'o' — triangular berry cluster with leaves. Never reads as bomb." },
              { id: "V22", name: "Branch Berries", file: "v22-branch-berries", desc: "Berry branch extends from C — 3 berries on a botanical branch with leaves." },
              { id: "V23", name: "Berry Pair", file: "v23-berry-pair", desc: "Both o's in 'Colaberry' are berries connected by a vine stem." },
              { id: "V24", name: "Berry Dots (Pure Wordmark)", file: "v24-berry-dots", desc: "No standalone mark — 3 coral dots cluster as i-tittle in AI. Maximum restraint." },
              { id: "V25", name: "Cola+Berry Ligature", file: "v25-cola-berry-ligature", desc: "y-descender becomes a branch with 2 hanging berries. Embedded in letterform." },
              { id: "V26", name: "Berry Counter (FedEx Arrow)", file: "v26-berry-counter", desc: "3 micro dots inside the 'a' counter. Hidden detail — discoverable at large sizes." },
            ].map((c) => (
              <div key={c.id} className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-zinc-900">{c.id} — {c.name}</h3>
                </div>
                <p className="text-sm text-zinc-400">{c.desc}</p>
                <div className="flex justify-center items-center py-8 rounded-xl border border-zinc-100 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/brand/candidates/${c.file}.svg`} alt={`${c.id} ${c.name}`} className="max-w-[400px] w-full" />
                </div>
              </div>
            ))}

            {/* V27 & V28 — Standalone marks */}
            {[
              { id: "V27", name: "Berry Sprig (Standalone Mark)", mark: "v27-berry-sprig-mark", lockup: "v27-berry-sprig-lockup", desc: "3-berry sprig with branch and leaves. At 16px: 3 dots in triangle. At large: full botanical detail." },
              { id: "V28", name: "Berry Monogram C (Standalone Mark)", mark: "v28-berry-monogram-c-mark", lockup: "v28-berry-monogram-c-lockup", desc: "Letter C cradles 3 berry circles inside. Reads as 'C for Colaberry + berries'." },
            ].map((c) => (
              <div key={c.id} className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-zinc-900">{c.id} — {c.name}</h3>
                </div>
                <p className="text-sm text-zinc-400">{c.desc}</p>
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <div className="flex justify-center items-center py-8 rounded-xl border border-zinc-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/brand/candidates/${c.lockup}.svg`} alt={`${c.id} Lockup`} className="max-w-[440px] w-full" />
                  </div>
                  <div className="flex justify-center items-center py-4 px-6 rounded-xl border border-zinc-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/brand/candidates/${c.mark}.svg`} alt={`${c.id} Mark`} className="w-16 h-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-zinc-200" />

          {/* ══════════════════════════════════════════════════════════════
             V11–V18 — PREVIOUS AGENT-GENERATED CONCEPTS
             ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900">
                V11–V18 — Agent-Generated Concepts <span className="text-xs font-medium px-3 py-1 rounded-full ml-2 bg-[#357895]/10 text-[#357895]">NEW</span>
              </h2>
              <p className="text-zinc-500 text-base max-w-3xl">
                8 concepts using the 12 Embedding Techniques. Each embeds visual clues in letterforms — the viewer reads &quot;ColaberryAI&quot; first, then discovers the berry, the intelligence signal, and the science reference.
              </p>
            </div>

            {v13Logos.map(({ id, name, elements, technique, clues, Wordmark }) => (
              <div key={id} className="rounded-2xl border border-zinc-200 bg-white p-8 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-zinc-900">{id} — {name}</h3>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 font-medium">{elements} elements</span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">Technique: {technique}</p>
                  </div>
                </div>

                {/* Side-by-side dark/light */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-center items-center py-10 rounded-xl border border-zinc-100 bg-white">
                    <Wordmark scale={1.5} mode="light" color="tbi" />
                  </div>
                  <div className="flex justify-center items-center py-10 rounded-xl bg-zinc-950">
                    <Wordmark scale={1.5} mode="dark" color="tbi" />
                  </div>
                </div>

                {/* Clue annotation */}
                <div className="p-3 rounded-lg bg-zinc-50 text-sm">
                  <p className="font-semibold text-zinc-600 mb-1">Visual Clues</p>
                  <p className="text-zinc-400">{clues}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════════
             LEGACY — V1–V2, V9–V10 (Reference)
             ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-8 pt-8 border-t border-zinc-200">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-400">Previous Concepts (V1–V2, V9–V10)</h2>
              <p className="text-zinc-400 text-sm">Earlier rounds — kept for reference.</p>
            </div>

            {legacyLogos.map(({ id, name, desc, Wordmark }) => (
              <div key={id} className="rounded-2xl border border-zinc-100 bg-white p-8 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-500">{id} — {name}</h3>
                  <p className="text-sm text-zinc-300 mt-1">{desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-center items-center py-10 rounded-xl border border-zinc-100 bg-white">
                    <Wordmark scale={1.5} mode="light" color="tbi" />
                  </div>
                  <div className="flex justify-center items-center py-10 rounded-xl bg-zinc-950">
                    <Wordmark scale={1.5} mode="dark" color="tbi" />
                  </div>
                </div>
              </div>
            ))}

            {/* Bracket Marks */}
            {bracketMarks.map(({ id, name, desc, Mark }) => (
              <div key={id} className="rounded-2xl border border-zinc-100 bg-white p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-500">{id} — {name}</h3>
                  <p className="text-sm text-zinc-300 mt-1">{desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col justify-center items-center gap-4 py-8 rounded-xl border border-zinc-100 bg-white">
                    <Mark size={120} mode="light" color="tbi" />
                    <BracketLockup Mark={Mark} mode="light" markSize={48} color="tbi" />
                  </div>
                  <div className="flex flex-col justify-center items-center gap-4 py-8 rounded-xl bg-zinc-950">
                    <Mark size={120} mode="dark" color="tbi" />
                    <BracketLockup Mark={Mark} mode="dark" markSize={48} color="tbi" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
