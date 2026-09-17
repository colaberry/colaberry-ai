/**
 * Relevance + ranking for the developer slice of AI. Ported from the standalone
 * ai-dev-wire pipeline.
 *
 * Design notes (learned the hard way):
 *  - Short tokens (ai, llm, gpt, mcp) MUST match on word boundaries. A bare
 *    includes("ai") matches "email", "said", "available" — that is how
 *    "Dolly Parton has died" and an iCloud story reached the brief.
 *  - Requiring AI-term AND dev-term was too strict: it dropped "Granite 4.2
 *    LLMs: How They're Built". So the gate is now AI-topic + a consumer-noise
 *    blocklist, and the dev angle is a *ranking* signal rather than a veto.
 */
import type { WireItem } from "./types";

const AI_EXACT = ["ai", "llm", "llms", "gpt", "rag", "mcp", "gpu", "gpus", "agi", "ml", "slm", "vlm"];
const AI_LOOSE = [
  "claude", "gemini", "llama", "qwen", "deepseek", "mistral", "anthropic", "openai", "copilot", "cursor",
  "codex", "agent", "agentic", "embedding", "transformer", "inference", "fine-tun", "finetun", "fine tun",
  "prompt", "model context protocol", "diffusion", "multimodal", "vllm", "langchain", "llamaindex",
  "pytorch", "tensorflow", "hugging face", "huggingface", "quantiz", "vector database", "context window",
  "reasoning model", "neural", "machine learning", "deep learning", "open-weight", "open weights",
  "chatbot", "frontier model", "foundation model", "mixture-of-experts", "tokenizer", "ollama",
];
/** Dev/infra signal — boosts rank, and gates the noisiest firehose (HN). */
const DEV_EXACT = ["api", "apis", "sdk", "cli", "ide", "oss", "ci", "cd", "tpu", "npu"];
const DEV_LOOSE = [
  "develop", "engineer", "code", "coding", "program", "library", "framework", "open source", "open-source",
  "release", "launch", "ship", "buil", "benchmark", "eval", "latency", "throughput", "deploy", "runtime",
  "server", "repo", "github", "typescript", "python", "rust", "javascript", "golang", "docs", "tooling",
  "toolchain", "architecture", "pipeline", "integration", "protocol", "version", "model", "research",
  "paper", "training", "train", "self-host", "local-first", "workflow", "debug", "test", "refactor",
  "pull request", "package", "app", "platform", "infra", "observability", "nvidia", "chip", "silicon",
  "datacenter", "data center", "cluster", "context", "compiler", "kernel", "database", "serverless",
  "container", "kubernetes", "docker", "token", "weights", "checkpoint", "dataset", "distill",
];
/** Consumer / business coverage that is AI-adjacent but not development work. */
const NOISE = [
  "home decor", "recipe", "shopping", "discount", "coupon", "celebrity", "horoscope", "dating app",
  "share price", "stock price", "earnings call", "ipo", "valuation", "lawsuit", "settles", "subpoena",
  "super bowl", "gift guide", "black friday", "weight loss", "skincare", "travel deal", "real estate",
  "sports betting", "fashion", "wedding", "parenting tips",
];

const wordRe = (list: string[]): RegExp => new RegExp(`\\b(${list.join("|")})\\b`, "i");
const AI_EXACT_RE = wordRe(AI_EXACT);
const DEV_EXACT_RE = wordRe(DEV_EXACT);
const hasLoose = (s: string, list: string[]): boolean => list.some((k) => s.includes(k));
const norm = (t = "", d = ""): string => `${t} ${d}`.toLowerCase();

export const isAiTopic = (s: string): boolean => AI_EXACT_RE.test(s) || hasLoose(s, AI_LOOSE);
export const isNoise = (s: string): boolean => hasLoose(s, NOISE);

/** How strong the "someone building software cares about this" signal is. */
export function devScore(t = "", d = ""): number {
  const s = norm(t, d);
  let n = 0;
  if (DEV_EXACT_RE.test(s)) n += 1;
  for (const k of DEV_LOOSE) if (s.includes(k)) n += 1;
  return n;
}

/** Gate for AI-native sources (HF, arXiv cs.CL): AI topic, minus consumer noise. */
export function isRelevant(t = "", d = ""): boolean {
  const s = norm(t, d);
  return isAiTopic(s) && !isNoise(s);
}

/** Gate for general firehoses (HN, vendor blogs): also needs a real dev angle. */
export function isDevRelevant(t = "", d = ""): boolean {
  const s = norm(t, d);
  return isAiTopic(s) && !isNoise(s) && devScore(t, d) > 0;
}

/**
 * Collapse quantizations, ports and finetunes onto their base model so one hot
 * release does not eat the whole list. Keeps the highest-trending entry as
 * canonical and records how many variants were folded in.
 */
const VARIANT_SUFFIX =
  /[-_.](gguf|mlx|awq|gptq|exl2|exl3|fp8|fp16|bf16|int8|int4|8bit|4bit|3bit|2bit|w4a16|w8a8|abliterated|obliterated|uncensored|unsloth|quantized|onnx|openvino|trtllm|nf4|hqq|dwq|dynamic|i1)\b/gi;

export function dedupeModels(models: WireItem[]): WireItem[] {
  const groups = new Map<string, { canonical: WireItem; variants: number }>();
  for (const m of models) {
    const name = String(m.title).split("/").pop() || m.title;
    // Prefer truncating at the parameter-count token: everything after it
    // ("-Uncensored-HauhauCS-Aggressive-MTP-GGUF") is packaging, not a new model.
    const sized = name.match(/^(.*?\d+(?:\.\d+)?[bm])\b/i);
    const base = (sized ? sized[1] : name.replace(VARIANT_SUFFIX, "").replace(/[-_.]+$/g, "")).toLowerCase();
    const g = groups.get(base);
    if (!g) groups.set(base, { canonical: m, variants: 0 });
    else {
      g.variants += 1;
      if ((m.score || 0) > (g.canonical.score || 0)) g.canonical = m;
    }
  }
  return [...groups.values()].map(({ canonical, variants }) =>
    variants ? { ...canonical, variants } : canonical
  );
}
