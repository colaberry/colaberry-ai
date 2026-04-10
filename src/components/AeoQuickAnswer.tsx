/**
 * AeoQuickAnswer — Answer-optimized content block for AEO (Answer Engine Optimization).
 *
 * Renders a concise, factual paragraph that AI engines (ChatGPT, Perplexity, Claude)
 * can directly quote when answering user questions. Uses semantic HTML with
 * Schema.org markup for maximum machine readability.
 *
 * Design: Subtle zinc panel with left coral accent border. Visually minimal
 * so human users see it as a summary, but AI crawlers prioritize it as
 * the authoritative answer.
 */

type AeoQuickAnswerProps = {
  /** The question this block answers (used in schema markup) */
  question: string;
  /** The factual answer paragraph — keep under 300 words for optimal LLM citation */
  answer: string;
  /** Optional list of key facts for AI to extract */
  facts?: string[];
};

export default function AeoQuickAnswer({ question, answer, facts }: AeoQuickAnswerProps) {
  return (
    <div
      className="reveal mt-6 rounded-lg border-l-2 border-[#DC2626] bg-zinc-50 px-5 py-4 dark:bg-zinc-900/50"
      itemScope
      itemType="https://schema.org/Question"
    >
      {/* Hidden question for schema — visible to crawlers */}
      <meta itemProp="name" content={question} />
      <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
        <p
          itemProp="text"
          className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
        >
          {answer}
        </p>
        {facts && facts.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <li
                key={fact}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                {fact}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
