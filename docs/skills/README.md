# Skills

This folder holds Cowork/Claude **skills** related to the Prompt Builder project.

A skill is a small package — a `SKILL.md` instruction file plus any supporting
files — that Claude loads on demand to perform a task. It is independent of the
web app, but the `prompt-architect` skill reuses the same prompt schema, so the
two stay in sync.

## Layout

```
docs/skills/
├── build-skill.sh              # packages a skill folder into an installable .skill
├── prompt-architect/           # ← source of truth (edit these files)
│   ├── SKILL.md                # instructions + trigger description (frontmatter)
│   └── references/
│       └── schema.json         # the 10-element prompt schema the skill follows
└── prompt-architect.skill      # build artifact (generated; safe to delete/regenerate)
```

Edit the files under `prompt-architect/`. The `.skill` file is just a zip build
artifact — don't edit it by hand; regenerate it with the build script.

## Building the installable package

From this folder:

```bash
./build-skill.sh                 # builds prompt-architect.skill
```

Or build a different skill folder:

```bash
./build-skill.sh <skill-folder-name>
```

If the script isn't executable yet:

```bash
chmod +x build-skill.sh
```

The script zips the contents of the skill folder (so `SKILL.md` sits at the
archive root, which Cowork requires) and writes `<skill-name>.skill` here.

## Installing into Cowork

Open/double-click the generated `.skill` file and choose **Save skill**, or
share it via Cowork's file card and use the install button. Once installed,
the skill triggers automatically based on its `description` (see the frontmatter
in `SKILL.md`) — e.g. when you ask for help writing a prompt, or when you start
a complex, multi-step task where an upfront prompt would help.

## The prompt-architect skill

Interviews you through Anthropic's 10-element prompt structure one section at a
time and assembles a finished, correctly-tagged prompt. The 10 elements and the
questions asked are defined in `prompt-architect/references/schema.json` — the
**same schema** the web app uses. Change the schema once and both the skill and
the app follow.
