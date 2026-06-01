"use client";

import { useEffect, useState } from "react";
import { schema } from "@/lib/schema";
import { renderPrompt, type Answers } from "@/lib/renderPrompt";

export function Review({
  answers,
  onBack,
}: {
  answers: Answers;
  onBack: () => void;
}) {
  const { prompt, prefill } = renderPrompt(schema, answers);

  const [copied, setCopied] = useState(false);
  const [llmEnabled, setLlmEnabled] = useState(false);
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/run")
      .then((r) => r.json())
      .then((d) => setLlmEnabled(Boolean(d.enabled)))
      .catch(() => setLlmEnabled(false));
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    const body =
      prompt + (prefill ? `\n\n--- PREFILL (assistant start) ---\n${prefill}` : "");
    const blob = new Blob([body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const run = async () => {
    setRunning(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, prefill }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed.");
      } else {
        setResponse(data.text ?? "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-900">
          Review your prompt
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Assembled from your answers following the template&apos;s assembly
          order.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          disabled={!prompt}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {copied ? "Copied!" : "Copy prompt"}
        </button>
        <button
          type="button"
          onClick={download}
          disabled={!prompt}
          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50"
        >
          Download .md
        </button>
        {llmEnabled && (
          <button
            type="button"
            onClick={run}
            disabled={!prompt || running}
            className="rounded-lg border border-brand-500 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 disabled:opacity-50"
          >
            {running ? "Running…" : "Send to model"}
          </button>
        )}
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Assembled prompt
        </h3>
        <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border border-stone-200 bg-white p-4 font-mono text-sm leading-relaxed text-stone-800">
          {prompt || "(empty — fill in the required sections)"}
        </pre>
      </section>

      {prefill && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Prefill (assistant start)
          </h3>
          <pre className="overflow-auto whitespace-pre-wrap rounded-xl border border-brand-100 bg-brand-50 p-4 font-mono text-sm text-stone-800">
            {prefill}
          </pre>
        </section>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {response !== null && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Model response
          </h3>
          <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl border border-stone-200 bg-white p-4 font-mono text-sm leading-relaxed text-stone-800">
            {response}
          </pre>
        </section>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          ← Back to editing
        </button>
      </div>
    </div>
  );
}
