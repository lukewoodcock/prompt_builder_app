# skills/

The skills in this pool. Each skill is a folder whose root contains a
`SKILL.md` (YAML frontmatter + instructions), optionally with a `references/`
folder for supporting files.

**Installing skills (global or per-project, every client) is documented in the
repo's top-level `README.md`.** This file covers building packages and
skill-specific design notes.

## Building an installable package

Folder-based clients (Claude Code, Cursor) don't need a package — just copy the
skill folder (see top-level README). For the **Claude apps**, build a `.skill`:

```bash
./build-skill.sh                 # builds prompt-architect by default
./build-skill.sh <skill-folder>  # builds a specific skill
chmod +x build-skill.sh          # if it isn't executable yet
```

The script zips the contents of the skill folder so `SKILL.md` sits at the
archive root (required), and writes `<skill>.skill` here. The `.skill` is a
build artifact — regenerate it; don't edit it by hand.

## prompt-architect

Interviews you through Anthropic's 10-element prompt structure (or synthesizes a
draft from the conversation so far) and assembles a finished, correctly-tagged
prompt. The elements and questions are defined in
`prompt-architect/references/schema.json`.

### Triggering vs. proactive offering (design note)

Two behaviours, handled by two mechanisms — because a skill can only do one well:

1. **Explicit requests → the skill.** When the user actually asks for a prompt
   ("help me write a prompt for X", "improve this system prompt"), the skill's
   `description` matches and it triggers. Verified working in real clients.
2. **Proactive offers → a rule, not the skill.** We also wanted the assistant to
   offer prompt-building when someone sets up a reusable AI task *without*
   mentioning a prompt. Testing showed a skill **cannot** reliably do this:
   triggering keys off stated intent, and "help me build an automation" is not a
   request for a prompt. Pushing the description harder only risked hijacking
   one-offs. So the proactive offer lives in an always-on rule instead —
   `rules/prompt-architect-offer.md` (install per the top-level README).

**Division of labour:** the rule catches the proactive moment and makes the
offer; the skill does the prompt-building (and fires on explicit requests).
Complementary, not redundant.
