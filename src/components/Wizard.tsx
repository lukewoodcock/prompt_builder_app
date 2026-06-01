"use client";

import { useEffect, useMemo, useState } from "react";
import { schema, type SchemaSection } from "@/lib/schema";
import type { Answers, SectionAnswers } from "@/lib/renderPrompt";
import { Field } from "./Field";
import { Collapsible } from "./Collapsible";
import { Review } from "./Review";

const STORAGE_KEY = "prompt-builder-answers-v1";

/** Build the initial answers object, honouring boolean field defaults. */
function buildInitialAnswers(): Answers {
  const out: Answers = {};
  for (const section of schema.sections) {
    const sectionAnswers: SectionAnswers = {};
    for (const field of section.fields) {
      if (field.type === "boolean") {
        sectionAnswers[field.key] = Boolean(field.default);
      }
    }
    out[section.id] = sectionAnswers;
  }
  return out;
}

function loadAnswers(): Answers {
  if (typeof window === "undefined") return buildInitialAnswers();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialAnswers();
    const parsed = JSON.parse(raw) as Answers;
    // Merge over defaults so newly added fields still get sane values.
    const base = buildInitialAnswers();
    for (const id of Object.keys(base)) {
      base[id] = { ...base[id], ...(parsed[id] || {}) };
    }
    return base;
  } catch {
    return buildInitialAnswers();
  }
}

function sectionHasContent(
  section: SchemaSection,
  values: SectionAnswers
): boolean {
  return section.fields.some((f) => {
    const v = values[f.key];
    if (f.type === "boolean") return false; // booleans don't count as "filled"
    if (typeof v === "string") return v.trim() !== "";
    if (Array.isArray(v)) {
      return v.some((item) =>
        typeof item === "string"
          ? item.trim() !== ""
          : Object.values(item as Record<string, unknown>).some(
              (x) => typeof x === "string" && x.trim() !== ""
            )
      );
    }
    return false;
  });
}

export function Wizard() {
  const sections = schema.sections;
  const total = sections.length;

  const [answers, setAnswers] = useState<Answers>(buildInitialAnswers);
  const [step, setStep] = useState(0); // 0..total-1 = sections, total = review
  const [hydrated, setHydrated] = useState(false);

  // Load persisted answers after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    setAnswers(loadAnswers());
    setHydrated(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* storage unavailable */
    }
  }, [answers, hydrated]);

  const onReview = step >= total;
  const section = onReview ? null : sections[step];

  const setFieldValue = (sectionId: string, key: string, value: unknown) => {
    setAnswers((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], [key]: value },
    }));
  };

  const canProceed = useMemo(() => {
    if (!section) return true;
    if (!section.required) return true;
    return sectionHasContent(section, answers[section.id] || {});
  }, [section, answers]);

  const reset = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setAnswers(buildInitialAnswers());
    setStep(0);
  };

  if (onReview) {
    return (
      <div>
        <ProgressBar current={total} total={total} onJump={setStep} />
        <Review answers={answers} onBack={() => setStep(total - 1)} />
      </div>
    );
  }

  const values = answers[section!.id] || {};

  return (
    <div>
      <ProgressBar current={step} total={total} onJump={setStep} />

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
            {section!.order}
          </span>
          <h2 className="text-lg font-semibold text-stone-900">
            {section!.label}
          </h2>
          {section!.required ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
              Required
            </span>
          ) : (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
              Optional
            </span>
          )}
        </div>

        <p className="mb-1 text-base font-medium text-stone-800">
          {section!.uiQuestion}
        </p>
        <p className="mb-5 text-sm text-stone-600">{section!.helpText}</p>

        <div className="space-y-4">
          {section!.fields.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(v) => setFieldValue(section!.id, field.key, v)}
            />
          ))}
        </div>

        {(section!.examples.length > 0 || section!.tips.length > 0) && (
          <div className="mt-6 space-y-2">
            {section!.examples.length > 0 && (
              <Collapsible title="Examples">
                <ul className="space-y-2">
                  {section!.examples.map((ex, i) => (
                    <li
                      key={i}
                      className="whitespace-pre-wrap rounded bg-stone-50 p-2 font-mono text-xs"
                    >
                      {ex}
                    </li>
                  ))}
                </ul>
              </Collapsible>
            )}
            {section!.tips.length > 0 && (
              <Collapsible title="Tips">
                <ul className="list-disc space-y-1 pl-5">
                  {section!.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </Collapsible>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-40"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {!section!.required && (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="text-sm font-medium text-stone-500 hover:text-stone-800"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed}
            className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            title={
              canProceed ? undefined : "This required section needs an answer."
            }
          >
            {step === total - 1 ? "Review →" : "Next →"}
          </button>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={reset}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Reset all answers
        </button>
      </div>
    </div>
  );
}

function ProgressBar({
  current,
  total,
  onJump,
}: {
  current: number;
  total: number;
  onJump: (step: number) => void;
}) {
  const stepNum = Math.min(current + 1, total);
  const pct = Math.round((Math.min(current, total) / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-stone-700">
          {current >= total ? "Review" : `Step ${stepNum} of ${total}`}
        </span>
        <span className="text-stone-400">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Go to step ${i + 1}`}
            className={
              "h-2.5 w-2.5 rounded-full transition-colors " +
              (i === current
                ? "bg-brand-500"
                : i < current
                ? "bg-brand-300"
                : "bg-stone-300 hover:bg-stone-400")
            }
          />
        ))}
      </div>
    </div>
  );
}
