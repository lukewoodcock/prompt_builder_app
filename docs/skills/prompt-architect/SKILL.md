---
name: prompt-architect
description: Build a high-quality, structured prompt for an AI model using Anthropic's 10-element prompt structure, by interviewing the user or synthesizing one from the conversation so far. Use this skill whenever the user wants to write, design, draft, improve, rewrite, refine, or templatize a prompt or system prompt, or asks for help "prompting" a model or getting more consistent results from one. Also reach for it proactively when the user is setting up a reusable or reliability-sensitive AI task — a prompt they will run repeatedly, an agent or automation, a team workflow, a classification or extraction step, or any task where consistent, dependable model output matters — and mid-conversation when a task has sprawled into many requirements worth capturing as one structured prompt. (Not needed for simple one-off questions, casual chat, or quick single-line prompts.) Produces a finished, copy-ready prompt with each element correctly ordered and tagged.
---

# Prompt Architect

Guide the user through composing a strong prompt by interviewing them one section at a time, then assemble their answers into a finished prompt. Based on Anthropic's 10-element prompt structure.

## When triggered proactively (offer, never force)

This applies when the skill activated on its own rather than from an explicit "help me write a prompt" request. Two situations:

- **At the start of a task** the user is defining as *reusable or reliability-sensitive* — something they'll run repeatedly, an agent/automation, a team workflow, or work where consistent output matters. (Mere size or complexity is not enough; a big one-off doesn't qualify.)
- **Mid-conversation**, when a task that began simply has *sprawled* into many requirements, constraints, or rounds of back-and-forth — a sign that capturing it as a structured prompt would help.

In both situations the rule is the same — **offer once, softly, and respect the answer**:

1. **Make a single, soft, explicitly-optional offer — then stop and wait.** Do not launch the interview, and do not pre-empt it with your own clarifying questions. Mid-conversation, the strongest offer is a *draft* (see "Drafting from the conversation so far" below): "We've covered a lot here — want me to pull this into a structured, reusable prompt you could keep? Optional." At the start of a task, a one-liner: "Want me to help you architect a reusable prompt for this first? Totally optional." Then wait.

2. **If they accept**, proceed — either present a draft (mid-conversation) or run the interview (see "How to use this skill").

3. **If they decline, hesitate, ignore the offer, or just continue the underlying task** — drop the skill completely and immediately. Continue **exactly as you would have without it ever triggering**, including using AskUserQuestion for ordinary scoping. Do not nag, do not re-offer, do not otherwise change your behaviour.

4. **Offer at most once per task.** A single declined or ignored offer settles it for the rest of the conversation, unless the user later explicitly asks for prompt help.

The goal: the user should never feel railroaded into authoring a prompt. The skill adds a *no-cost option*; if they don't want it, it must be invisible from that point on.

## Drafting from the conversation so far

When the skill is accepted **mid-conversation** (or whenever the discussion already contains rich detail), do **not** start a cold interview. Instead:

1. **Draft first.** Synthesize a complete first-pass prompt by mining what's already been said — map the conversation onto the 10 elements (role/goal, rules, examples, the actual request, output format, etc.) using `references/schema.json` and the rendering conventions below. Fill what you can infer; leave thin sections clearly marked (e.g. *"Examples: (none yet — optional)"*).

2. **Present the draft** in a single code block so it's immediately usable, with a one-line note on which sections you inferred and which look sparse.

3. **Offer three clear paths — this is the moment the interview becomes opt-in:**
   - **Accept** — they're happy; finalize it and offer to save it as a reusable template or test it against a model.
   - **Decline** — they don't want it after all; drop it and continue the underlying task as normal (per the rules above).
   - **Refine via interview** — they want it tightened; *now* walk the relevant sections using the interview flow below, starting from the draft (confirm/adjust each rather than asking from scratch), focusing on the sparse or important sections rather than re-asking what's already captured.

This draft-first pattern is lower-friction than interviewing cold and keeps the structured interview as a refinement step the user chooses, not a gate.

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
