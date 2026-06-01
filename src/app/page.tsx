import { Wizard } from "@/components/Wizard";
import { schema } from "@/lib/schema";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          {schema.title}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          A step-by-step wizard for composing high-quality prompts using
          Anthropic&apos;s 10-element prompt structure. Answer one section at a
          time, then copy, download, or send the assembled prompt.
        </p>
      </header>
      <Wizard />
      <footer className="mt-12 text-center text-xs text-stone-400">
        Template v{schema.version} · {schema.sections.length} sections
      </footer>
    </main>
  );
}
