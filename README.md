# Prompt Builder — Anthropic 10-element wizard

A step-by-step "prompt builder" wizard built on Anthropic's 10-element prompt
structure. Answer one section at a time and the app assembles a clean,
XML-delimited prompt you can copy, download, or (optionally) send to a model.

Built with **Next.js (App Router) + TypeScript + React + Tailwind CSS**, with
validation via **Zod**. No database.

## What it does

- Renders one wizard step per section, driven entirely by a schema
  (`src/lib/schema.ts`) — the 10 steps are **not** hardcoded in the UI.
- Supports every field type in the schema: `text`, `textarea`, `boolean`
  (toggle, honouring `default`), `fileList` (repeatable filename list), and
  `exampleList` (repeatable input/output pairs).
- Shows each section's `label`, `uiQuestion`, `helpText`, and collapsible
  `examples` / `tips`.
- Progress indicator (Step N of 10), Back/Next navigation, clickable step dots,
  and a **Skip** action for optional sections. Required sections block "Next"
  until answered.
- Persists answers in React state and `localStorage`, so a refresh keeps your
  progress.
- A **Review** screen that assembles the prompt via the ported renderer
  (`src/lib/renderPrompt.ts`) and offers **Copy** and **Download (.md)**. The
  `prefill` (assistant-start) string is shown separately when present.

## Project structure

```
prompt-builder-app/
├── README.md
├── .env.example
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── api/run/route.ts     # optional LLM route (GET status + POST run)
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── Collapsible.tsx
    │   ├── Field.tsx            # renders the right control per field type
    │   ├── Review.tsx          # assemble + copy/download/send
    │   └── Wizard.tsx          # schema-driven stepper + persistence
    └── lib/
        ├── renderPrompt.ts     # TypeScript port of render-prompt.js
        ├── schema.ts           # the 10-element template schema (typed)
        └── validation.ts       # Zod schema for the API route
```

## Setup & run

Requires Node 18.18+ (Node 20+ recommended).

```bash
cd prompt-builder-app
npm install
npm run dev
```

Open http://localhost:3000.

To build and run the production server:

```bash
npm run build
npm start
```

## Optional: send the prompt to a model (OFF by default)

The app works fully as an assemble-and-export tool with no API key.

To enable the **"Send to model"** button on the Review screen, set an Anthropic
API key **server-side**:

```bash
cp .env.example .env.local
# then edit .env.local:
ANTHROPIC_API_KEY=sk-ant-...
```

Restart the dev server. The Review screen calls `GET /api/run` on load; if the
key is present it reveals the button, otherwise the button stays hidden and the
app behaves as a pure builder.

How it works:

- The key is read **only** in `src/app/api/run/route.ts` via
  `process.env.ANTHROPIC_API_KEY` and is never sent to the browser.
- `POST /api/run` validates the body with Zod, sends the assembled prompt as a
  `user` message, and — if a `prefill` is provided — adds it as the start of the
  `assistant` turn (Anthropic's response-prefilling technique).
- Default model: `claude-sonnet-4-6` (change `DEFAULT_MODEL` in the route).

## Deploy to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel, **New Project** → import the repo. Framework preset: **Next.js**
   (auto-detected). Build command `next build`, output handled automatically.
3. (Optional) Under **Settings → Environment Variables**, add
   `ANTHROPIC_API_KEY` to enable the "Send to model" feature in the deployment.
   Leave it unset to ship the export-only build.
4. Deploy. Re-deploy after changing env vars.

You can also deploy from the CLI:

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

## Notes on the foundation files

- `src/lib/schema.ts` is a typed copy of `prompt-template-schema.json`.
- `src/lib/renderPrompt.ts` is a faithful TypeScript port of `render-prompt.js`:
  same `isEmpty`/`wrap` helpers, same per-section renderers, same handling of
  `assemblyOrder` and the separate `prefill` return value.
