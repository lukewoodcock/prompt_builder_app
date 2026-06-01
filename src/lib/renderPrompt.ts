/**
 * renderPrompt.ts
 * TypeScript port of render-prompt.js. Assembles a final prompt string from
 * user answers collected by the wizard UI, following the structure in
 * prompt-template-schema.json. Per-section rendering behaviour is identical
 * to the original Node renderer.
 */

import type { PromptSchema } from "./schema";

export interface ExamplePair {
  input?: string;
  output?: string;
}

export type SectionAnswers = Record<string, unknown>;
export type Answers = Record<string, SectionAnswers>;

export interface RenderResult {
  prompt: string;
  prefill: string;
}

function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function wrap(tag: string | null, content: string): string {
  if (!tag) return content;
  return `<${tag}>\n${content}\n</${tag}>`;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Per-section renderers. Each returns a string block, or "" to omit the section.
 * `f` = the field values object for that section.
 */
const renderers: Record<string, (f: SectionAnswers) => string> = {
  task_context(f) {
    const parts: string[] = [];
    if (!isEmpty(f.role)) parts.push(str(f.role).trim());
    if (!isEmpty(f.highLevelGoal)) parts.push(str(f.highLevelGoal).trim());
    return parts.join("\n\n");
  },

  tone_context(f) {
    return isEmpty(f.tone) ? "" : str(f.tone).trim();
  },

  background_data(f) {
    const parts: string[] = [];
    if (!isEmpty(f.documents)) parts.push(str(f.documents).trim());
    if (!isEmpty(f.attachments)) {
      const list = (f.attachments as string[]).map((a) => `- ${a}`).join("\n");
      parts.push(`Attached files:\n${list}`);
    }
    return parts.join("\n\n");
  },

  task_description_and_rules(f) {
    const parts: string[] = [];
    if (!isEmpty(f.instructions))
      parts.push(`Your task:\n${str(f.instructions).trim()}`);
    if (!isEmpty(f.rules)) parts.push(`Rules:\n${str(f.rules).trim()}`);
    if (!isEmpty(f.edgeCases))
      parts.push(`Edge cases:\n${str(f.edgeCases).trim()}`);
    return parts.join("\n\n");
  },

  examples(f) {
    if (isEmpty(f.examples)) return "";
    return (f.examples as ExamplePair[])
      .filter((ex) => !isEmpty(ex.input) || !isEmpty(ex.output))
      .map(
        (ex) =>
          `<example>\n<input>${(ex.input || "").trim()}</input>\n<output>${(
            ex.output || ""
          ).trim()}</output>\n</example>`
      )
      .join("\n");
  },

  conversation_history(f) {
    return isEmpty(f.history) ? "" : str(f.history).trim();
  },

  immediate_task(f) {
    return isEmpty(f.request) ? "" : str(f.request).trim();
  },

  think_step_by_step(f) {
    if (!f || f.enableThinking === false) return "";
    if (!isEmpty(f.thinkingInstruction))
      return str(f.thinkingInstruction).trim();
    return "Think step by step inside <thinking></thinking> tags before writing your final answer. The user will not see the thinking.";
  },

  output_formatting(f) {
    const parts: string[] = [];
    if (!isEmpty(f.format)) parts.push(str(f.format).trim());
    if (!isEmpty(f.lengthLimit))
      parts.push(`Length: ${str(f.lengthLimit).trim()}`);
    return parts.join("\n");
  },

  // prefilled_response is handled separately (it starts the assistant turn).
};

export function renderPrompt(
  schema: PromptSchema,
  answers: Answers
): RenderResult {
  const order = schema.usage.assemblyOrder;
  const sectionsById = Object.fromEntries(
    schema.sections.map((s) => [s.id, s])
  );
  const blocks: string[] = [];

  for (const id of order) {
    if (id === "prefilled_response") continue;
    const section = sectionsById[id];
    const fieldValues = (answers && answers[id]) || {};
    const renderer = renderers[id];
    if (!renderer) continue;

    const content = renderer(fieldValues);
    if (isEmpty(content)) continue;

    blocks.push(wrap(section.wrapTag, content));
  }

  const prompt = blocks.join("\n\n");
  const prefill =
    answers &&
    answers.prefilled_response &&
    !isEmpty(answers.prefilled_response.prefill)
      ? str(answers.prefilled_response.prefill).trim()
      : "";

  return { prompt, prefill };
}
