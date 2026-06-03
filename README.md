# Skills Pool

A small, shareable collection of **Agent Skills** (and optional companion
rules) for AI coding/assistant clients — Claude Code, the Claude apps, Cursor,
and any other tool that supports the open Agent Skills standard.

Clone it once and install whichever skills you want, globally (available
everywhere) or per-project (committed to a specific repo). Colleagues can share
the same pool and stay in sync with `git pull`.

## Layout

```
.
├── skills/
│   ├── build-skill.sh           # package any skill folder into an installable .skill
│   └── <skill-name>/            # one folder per skill; SKILL.md at its root
│       ├── SKILL.md             # frontmatter (name + description) + instructions
│       └── references/          # optional supporting files
└── rules/
    └── <skill-name>-offer.md    # optional always-on rule that pairs with a skill
```

A **skill** is just a folder whose root holds a `SKILL.md`. That's the entire
standard — which is why the install steps below are identical for every skill
in `skills/`, including ones added later.

## Available skills

- **prompt-architect** — builds a structured, reusable prompt using Anthropic's
  10-element prompt structure, by interviewing you or synthesizing one from the
  conversation. See `skills/prompt-architect/` and the notes in
  `skills/README.md`.

---

## Installing a skill

Pick a **client** and a **scope** (global = everywhere; project = one repo).
In every case you're doing the same thing: **put the skill folder where the
client looks for skills, with `SKILL.md` at the folder's root.** Replace
`<skill>` with the folder name (e.g. `prompt-architect`).

### Claude Code

```bash
# Global (all your projects)
cp -r skills/<skill> ~/.claude/skills/

# Project-scoped (committed to a repo)
cp -r skills/<skill> /path/to/repo/.claude/skills/
```

Run `/skills` to confirm it loaded. Changes under a skills directory take effect
within the session. Docs: https://code.claude.com/docs/en/skills

### Cursor

```bash
# Global
cp -r skills/<skill> ~/.cursor/skills/

# Project-scoped
cp -r skills/<skill> /path/to/repo/.cursor/skills/
```

Docs: https://cursor.com/docs/skills

### Claude apps (desktop / web / Cowork)

These install from the packaged `.skill` file rather than a folder. Build it,
then **Save skill** (open the file) or upload it in the app's skills settings:

```bash
cd skills && ./build-skill.sh <skill>      # produces skills/<skill>.skill
```

Installing via the app applies to your account (effectively global).

### Stay-in-sync option (recommended for a shared pool)

Instead of copying, **symlink** from your clone so `git pull` updates the
installed skill automatically:

```bash
ln -s "$(pwd)/skills/<skill>" ~/.claude/skills/<skill>     # Claude Code, global
ln -s "$(pwd)/skills/<skill>" ~/.cursor/skills/<skill>     # Cursor, global
```

(Some clients don't follow symlinks for skills — if a symlinked skill doesn't
appear, fall back to `cp -r` and re-copy after pulling updates.)

---

## Companion rules (optional)

Skill triggering keys off the user's **stated intent**, so a skill reliably
fires when you *ask* for what it does — but it can't reliably *proactively
offer* itself for an adjacent need the user didn't mention. That proactive
behaviour belongs in **always-on instructions** instead, which load every turn:

- **Claude Code:** paste the rule into `<repo>/CLAUDE.md` (project) or
  `~/.claude/CLAUDE.md` (global).
- **Cursor:** project rules go in `<repo>/.cursor/rules/*.mdc`; the global
  equivalent is **User Rules** (Cursor Settings → Rules).
- **Claude apps:** paste it into your personal preferences / custom instructions.

The `rules/` folder holds copy-pasteable rule text for skills that benefit from
a proactive offer (e.g. `rules/prompt-architect-offer.md`). Use a rule only if
you want the assistant to *suggest* a skill unprompted; the skill works on its
own without it.

---

## Adding a new skill to the pool

1. Create `skills/<your-skill>/SKILL.md` with YAML frontmatter (`name`,
   `description`) and instructions. Add a `references/` folder if it needs
   supporting files.
2. Write a "pushy but precise" `description` — it's the primary trigger. State
   what the skill does *and* the contexts it should fire in. (See
   `skills/prompt-architect/SKILL.md` for a worked example.)
3. Optionally add `rules/<your-skill>-offer.md` if it needs a proactive offer.
4. Add a one-line entry under **Available skills** above.
5. Package it if you'll install in a Claude app: `cd skills && ./build-skill.sh <your-skill>`.

No install-doc changes are needed — the steps above already cover any skill in
`skills/`.
