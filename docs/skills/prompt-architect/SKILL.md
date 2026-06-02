---
name: prompt-architect
description: Interview the user step by step to build a high-quality, structured prompt for an AI model, based on Anthropic's 10-element prompt structure. Triggers (a) when the user explicitly wants to write, design, draft, improve, or template a prompt, or asks for help "prompting" a model; and (b) proactively when the user is starting a substantial, multi-step, or repeatable task that will be driven by an AI prompt — for example building an app, agent, or automation, defining a reusable workflow, or kicking off complex work where a careful upfront prompt would materially improve the result. In case (b), briefly offer to architect the prompt first rather than assuming. Do NOT trigger for simple one-off questions, casual chat, or quick single-line prompts where a full interview would be overkill. Produces a finished, copy-ready prompt with each element wrapped in the right tags.
---

# Prompt Architect

Guide the user through composing a strong prompt by interviewing them one section at a time, then assemble their answers into a finished prompt. Based on Anthropic's 10-element prompt structure.

## When triggered proactively

This applies when the skill activated because the user is *starting a substantial or repeatable AI-driven task* (building an app, an agent, an automation, a reusable workflow) rather than explicitly asking for a prompt. The behaviour here is **offer, never force**:

1. **Make a single, soft offer — then stop and wait.** Do not launch the interview, and do not pre-empt it with clarifying questions of your own. In one short sentence, offer the prompt-building step, e.g. *"Before we dive in — want me to help you architect a reusable prompt for this first? It can make a repeatable task like this go more smoothly. Totally optional."* Make clear it's optional. Then wait for the user's answer.

2. **If they accept**, proceed into the interview (see "How to use this skill" below).

3. **If they decline, hesitate, ignore the offer, or just answer the underlying task** — drop the skill completely and immediately. Continue **exactly as you would have without this skill ever triggering**: handle their request with your normal approach (including using AskUserQuestion for ordinary scoping if appropriate). Do not nag, do not re-offer later in the same task, and do not let the skill change your behaviour in any other way.

4. **Offer at most once per task.** A single declined (or ignored) offer means the user has chosen; respect that for the rest of the conversation unless they later explicitly ask for help with a prompt.

The goal: the user should never feel railroaded into authoring a prompt. The skill adds a *no-cost option* at the top of a complex task; if they don't want it, it must be invisible from that point on.

## How to use this skill

1. **Read the schema first.** Load `references/schema.json` (relative to this file). It is the source of truth: it defines the sections, their order (`usage.assemblyOrder`), each section's `wrapTag`, the `uiQuestion`/`helpText` to ask, the `fields` to collect, and `tips`. Follow it rather than relying on memory.

2. **Briefly orient the user.** In one or two sentences, say you'll walk through up to 10 short sections and that most are optional — they can say "skip" on any, or "that's enough" to stop early and assemble what you have.

3. **Interview section by section, in `assemblyOrder`.** For each section:
   - Ask the section's `uiQuestion`. If the user seems unsure, offer the `helpText` and an example from the section's `examples`.
   - Sections with `"required": true` (task_context, task_description_and_rules, immediate_task) should be filled — gently prompt again if the user skips one, but never block them entirely.
   - Sections with `"required": false` can be skipped freely. Don't force content that doesn't apply.
   - **Group sensibly.** You don't have to send 10 separate messages. Ask one focused question at a time for the substantive sections, but it's fine to batch the quick/optional ones (e.g. tone, output format, prefill) into a single message to keep things brisk.
   - **Adapt.** If the user's task makes a section irrelevant (e.g. no documents, no conversation history), say so and move on. If they've already given you enough detail for a later section, confirm rather than re-asking.

4. **Infer where you reasonably can.** If the user gives a rich description up front, pre-fill sections from it and ask them only to confirm or adjust, rather than interrogating from scratch.

5. **Assemble the prompt.** Concatenate the completed sections in `assemblyOrder`, separated by blank lines. Wrap each section's content in its `wrapTag` (XML-style, e.g. `<documents>…</documents>`) when `wrapTag` is not null; leave it unwrapped when null. Follow the per-section rendering conventions below. Treat `prefilled_response` separately — it is the *start of the assistant's reply*, not part of the prompt body.

6. **Deliver.** Present the finished prompt in a single code block so it's easy to copy. If a prefill was provided, show it separately and labelled. Then offer: (a) to refine any section, (b) to save it as a reusable template, or (c) to run it against a model if the user wants to test it.

## Section rendering conventions

Mirror the behaviour of the reference renderer:

- **task_context** — role then high-level goal, as plain lines (no wrap).
- **tone_context** — the tone description, plain (no wrap).
- **background_data** — wrap in `<documents>`. List attachment names if given.
- **task_description_and_rules** — plain. Label sub-parts: `Your task:`, `Rules:`, `Edge cases:` as provided.
- **examples** — wrap each pair as `<example><input>…</input><output>…</output></example>`, all inside `<examples>`.
- **conversation_history** — wrap in `<history>`.
- **immediate_task** — the specific request, plain (no wrap).
- **think_step_by_step** — if enabled, include a thinking instruction (use the user's custom one, else the default: think inside `<thinking></thinking>` tags, hidden from the user). Skip entirely if disabled.
- **output_formatting** — plain. Append a length limit line if given.
- **prefilled_response** — NOT part of the prompt body. Return separately as the assistant's opening text.

## Principles to apply throughout

- Prefer specificity: nudge vague roles/goals toward concrete ones ("UK VAT tax accountant" over "accountant").
- Encourage an explicit fallback/escape hatch in the rules section to reduce hallucination.
- Recommend examples for any format-sensitive task — they're one of the strongest levers.
- Keep the interview light and conversational; this should feel like a quick guided setup, not a form to grind through.

## Output

A finished, copy-ready prompt with each element correctly ordered and tagged, plus any prefill shown separately — ready to paste into Claude or another model.
