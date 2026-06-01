/**
 * schema.ts
 * The prompt-template schema (Anthropic 10-element prompt structure),
 * copied verbatim from prompt-template-schema.json and typed for the app.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "boolean"
  | "fileList"
  | "exampleList";

export interface SchemaField {
  key: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  default?: boolean;
  itemSchema?: Record<string, string>;
}

export interface SchemaSection {
  id: string;
  order: number;
  label: string;
  required: boolean;
  wrapTag: string | null;
  helpText: string;
  uiQuestion: string;
  fields: SchemaField[];
  examples: string[];
  tips: string[];
}

export interface PromptSchema {
  $schema?: string;
  templateId: string;
  version: string;
  title: string;
  description: string;
  source?: Record<string, string>;
  usage: {
    uiPattern: string;
    instructions: string;
    assemblyOrder: string[];
  };
  sections: SchemaSection[];
}

export const schema: PromptSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  templateId: "anthropic-10-element-prompt",
  version: "1.0.0",
  title: "Structured Prompt Template",
  description:
    "A step-by-step template for composing high-quality prompts for AI models, based on Anthropic's 10-element prompt structure. Designed to drive a wizard-style UI that asks the user one section at a time, then assembles the answers into a final prompt in the order defined by `assemblyOrder`.",
  source: {
    workshop: "Anthropic prompt engineering workshop",
    video: "https://www.youtube.com/watch?v=hnKsaWqUk7A",
    referenceTimestamp: "https://youtu.be/hnKsaWqUk7A?t=1346",
  },
  usage: {
    uiPattern: "wizard",
    instructions:
      "Render each section in `sections` as one step. Show `label`, `helpText`, `examples`, and `tips` to guide the user. Collect input into the field(s) defined by `fields`. Skip steps where `required` is false and the user leaves them blank. After the last step, concatenate the rendered output of each completed section following `assemblyOrder`, separating sections with a blank line. Wrap section content in the XML-style tags given by `wrapTag` when present (Anthropic recommends XML tags to delimit prompt components).",
    assemblyOrder: [
      "task_context",
      "tone_context",
      "background_data",
      "task_description_and_rules",
      "examples",
      "conversation_history",
      "immediate_task",
      "think_step_by_step",
      "output_formatting",
      "prefilled_response",
    ],
  },
  sections: [
    {
      id: "task_context",
      order: 1,
      label: "Task context (role)",
      required: true,
      wrapTag: null,
      helpText:
        "Set the scene. Tell the model who it is and what overall job it's doing. Assigning a clear role or persona (e.g. 'You are a senior contracts lawyer') reliably improves quality because it primes the model with the right knowledge, vocabulary and standards.",
      uiQuestion: "Who should the AI be, and what is its overall job here?",
      fields: [
        {
          key: "role",
          type: "text",
          label: "Role / persona",
          placeholder:
            "e.g. You are an experienced financial analyst at a mid-sized SaaS company.",
        },
        {
          key: "highLevelGoal",
          type: "textarea",
          label: "High-level goal",
          placeholder:
            "e.g. You help the team turn raw quarterly numbers into clear, board-ready summaries.",
        },
      ],
      examples: [
        "You are a customer support lead for a B2B software product. You handle escalations with empathy and precision.",
        "You are a seasoned technical writer producing developer documentation.",
      ],
      tips: [
        "Be specific about seniority and domain — 'tax accountant specialising in UK VAT' beats 'accountant'.",
        "State the goal in one sentence; details come in later sections.",
      ],
    },
    {
      id: "tone_context",
      order: 2,
      label: "Tone context",
      required: false,
      wrapTag: null,
      helpText:
        "Describe the voice, register and attitude the response should have. This matters most for customer-facing, creative or brand-sensitive work.",
      uiQuestion: "What tone and style should the response have?",
      fields: [
        {
          key: "tone",
          type: "textarea",
          label: "Tone & style",
          placeholder:
            "e.g. Warm but professional. Plain English, no jargon. Concise.",
        },
      ],
      examples: [
        "Maintain a calm, reassuring tone suitable for an anxious customer.",
        "Be direct and punchy, in the style of a confident product marketer.",
      ],
      tips: [
        "Reference an audience to anchor tone (e.g. 'for non-technical executives').",
        "Name styles to avoid as well as styles to use.",
      ],
    },
    {
      id: "background_data",
      order: 3,
      label: "Background data, documents & images",
      required: false,
      wrapTag: "documents",
      helpText:
        "Paste the reference material the model should rely on: documents, data, transcripts, images, prior decisions. Put long content here, before the instructions, and tell the model to ground its answer in it.",
      uiQuestion:
        "What reference material should the AI use? Paste documents, data, or attach files.",
      fields: [
        {
          key: "documents",
          type: "textarea",
          label: "Documents / data",
          placeholder: "Paste source text, tables, transcripts, etc.",
        },
        {
          key: "attachments",
          type: "fileList",
          label: "Attachments (optional)",
          placeholder: "Images, PDFs, CSVs",
        },
      ],
      examples: [
        '<documents>\n<document index="1">\n<source>Q2_report.pdf</source>\n<content>...</content>\n</document>\n</documents>',
      ],
      tips: [
        "Place large documents near the top of the prompt — models attend well to material that precedes the instruction.",
        "Wrap each document in tags and give it an index/source so you can reference it later.",
        "Tell the model to quote or cite from the documents to reduce hallucination.",
      ],
    },
    {
      id: "task_description_and_rules",
      order: 4,
      label: "Detailed task description & rules",
      required: true,
      wrapTag: null,
      helpText:
        "The core instructions. Spell out exactly what to do, the constraints, edge cases, and what NOT to do. This is usually the longest and most important section.",
      uiQuestion:
        "What exactly should the AI do? List the steps, rules, and things to avoid.",
      fields: [
        {
          key: "instructions",
          type: "textarea",
          label: "What to do",
          placeholder: "Step-by-step or bulleted description of the task.",
        },
        {
          key: "rules",
          type: "textarea",
          label: "Rules & constraints",
          placeholder:
            "e.g. Never invent figures. If data is missing, say so. Stay under 300 words.",
        },
        {
          key: "edgeCases",
          type: "textarea",
          label: "Edge cases / fallback behaviour",
          placeholder:
            "e.g. If the question is out of scope, reply: 'I can only help with billing.'",
        },
      ],
      examples: [
        "Summarise the report in three sections: Highlights, Risks, Recommended actions. If a figure isn't in the source, write 'not provided' rather than estimating.",
      ],
      tips: [
        "Phrase rules positively where possible ('do X') as well as negatively ('never Y').",
        "Give the model an explicit escape hatch for situations it can't handle — this cuts hallucination.",
        "Number multi-step tasks so the model follows the sequence.",
      ],
    },
    {
      id: "examples",
      order: 5,
      label: "Examples (few-shot)",
      required: false,
      wrapTag: "examples",
      helpText:
        "Show, don't just tell. One or more input→output examples are one of the strongest levers for steering format and quality. Make examples mirror the real task closely.",
      uiQuestion: "Can you provide example(s) of good input and the ideal output?",
      fields: [
        {
          key: "examples",
          type: "exampleList",
          label: "Examples",
          itemSchema: { input: "text", output: "text" },
          placeholder: "Add input/ideal-output pairs.",
        },
      ],
      examples: [
        "<example>\n<input>Customer: My invoice is wrong.</input>\n<output>I'm sorry for the trouble. Could you share the invoice number so I can check it?</output>\n</example>",
      ],
      tips: [
        "Wrap examples in tags and keep their format identical to what you want back.",
        "Include a tricky/edge-case example, not just the easy one.",
        "2–3 well-chosen examples usually beat one.",
      ],
    },
    {
      id: "conversation_history",
      order: 6,
      label: "Conversation history",
      required: false,
      wrapTag: "history",
      helpText:
        "Prior turns of the conversation, if this prompt continues an existing exchange. Useful for multi-turn or chat-driven workflows.",
      uiQuestion: "Is there prior conversation the AI needs to know about?",
      fields: [
        {
          key: "history",
          type: "textarea",
          label: "Previous turns",
          placeholder: "User: ...\nAssistant: ...",
        },
      ],
      examples: [
        "<history>\nUser: I need help drafting a refund email.\nAssistant: Sure — who is it for?\n</history>",
      ],
      tips: [
        "Only include history that's relevant; trim noise.",
        "Clearly label speakers.",
      ],
    },
    {
      id: "immediate_task",
      order: 7,
      label: "Immediate task / request",
      required: true,
      wrapTag: null,
      helpText:
        "The specific thing you want right now. After all the setup, restate the precise ask so the model knows exactly what to produce in this turn.",
      uiQuestion: "What is the specific request for this turn?",
      fields: [
        {
          key: "request",
          type: "textarea",
          label: "The ask",
          placeholder:
            "e.g. Using the report above, write the Q2 board summary now.",
        },
      ],
      examples: ["Now, write the refund email to the customer described above."],
      tips: [
        "Keep it crisp — this is the trigger, not the place for new rules.",
        "Reference earlier sections explicitly ('using the documents above').",
      ],
    },
    {
      id: "think_step_by_step",
      order: 8,
      label: "Think step by step (precognition)",
      required: false,
      wrapTag: "thinking",
      helpText:
        "Ask the model to reason before answering. For analysis, math, or multi-constraint tasks, instructing it to think first — ideally in a scratchpad it can then ignore — improves accuracy.",
      uiQuestion: "Should the AI reason step-by-step before answering?",
      fields: [
        {
          key: "enableThinking",
          type: "boolean",
          label: "Ask the model to think first",
          default: true,
        },
        {
          key: "thinkingInstruction",
          type: "textarea",
          label: "Thinking instruction (optional)",
          placeholder:
            "e.g. First, list the constraints. Then check the data against each. Then write the answer.",
        },
      ],
      examples: [
        "Think step by step inside <thinking></thinking> tags before you write your final answer. The user will not see the thinking.",
      ],
      tips: [
        "Tell it to put reasoning in tags so you can strip it from the final output.",
        "For simple tasks, skip this — it adds latency without benefit.",
      ],
    },
    {
      id: "output_formatting",
      order: 9,
      label: "Output formatting",
      required: false,
      wrapTag: null,
      helpText:
        "Specify the exact structure of the answer: headings, JSON schema, length, language, tags. Precise format instructions make outputs predictable and machine-parseable.",
      uiQuestion: "How should the answer be formatted?",
      fields: [
        {
          key: "format",
          type: "textarea",
          label: "Format spec",
          placeholder:
            "e.g. Return valid JSON with keys 'summary' and 'actions'. No prose outside the JSON.",
        },
        {
          key: "lengthLimit",
          type: "text",
          label: "Length limit (optional)",
          placeholder: "e.g. Max 200 words",
        },
      ],
      examples: [
        "Format your answer as Markdown with an H2 for each section. Wrap the final answer in <answer></answer> tags.",
      ],
      tips: [
        "If you need to parse the output, demand a strict schema and 'no extra text'.",
        "Asking for output inside tags makes it easy to extract programmatically.",
      ],
    },
    {
      id: "prefilled_response",
      order: 10,
      label: "Prefilled response (assistant start)",
      required: false,
      wrapTag: null,
      helpText:
        "Optionally begin the assistant's reply for it. Prefilling the first few tokens (e.g. '{' for JSON, or '<answer>') forces format compliance and skips preamble.",
      uiQuestion: "Do you want to pre-start the AI's response (to force a format)?",
      fields: [
        {
          key: "prefill",
          type: "text",
          label: "Prefill text",
          placeholder: "e.g. {  or  <answer>",
        },
      ],
      examples: ["{", "<answer>"],
      tips: [
        "Use '{' to force JSON, or '<answer>' to skip chit-chat.",
        "Leave blank for normal conversational replies.",
      ],
    },
  ],
};

export default schema;
