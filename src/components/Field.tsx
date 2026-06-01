"use client";

import type { SchemaField } from "@/lib/schema";
import type { ExamplePair } from "@/lib/renderPrompt";

interface FieldProps {
  field: SchemaField;
  value: unknown;
  onChange: (value: unknown) => void;
}

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function Field({ field, value, onChange }: FieldProps) {
  switch (field.type) {
    case "text":
      return (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">
            {field.label}
          </span>
          <input
            type="text"
            className={inputClass}
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );

    case "textarea":
      return (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">
            {field.label}
          </span>
          <textarea
            rows={5}
            className={inputClass + " resize-y font-mono leading-relaxed"}
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );

    case "boolean": {
      const checked =
        typeof value === "boolean" ? value : Boolean(field.default);
      return (
        <label className="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={
              "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors " +
              (checked ? "bg-brand-500" : "bg-stone-300")
            }
          >
            <span
              className={
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
                (checked ? "translate-x-5" : "translate-x-0.5")
              }
            />
          </button>
          <span className="text-sm font-medium text-stone-700">
            {field.label}
          </span>
        </label>
      );
    }

    case "fileList":
      return (
        <FileListField field={field} value={value} onChange={onChange} />
      );

    case "exampleList":
      return (
        <ExampleListField field={field} value={value} onChange={onChange} />
      );

    default:
      return null;
  }
}

function FileListField({ field, value, onChange }: FieldProps) {
  const items: string[] = Array.isArray(value) ? (value as string[]) : [];

  const update = (next: string[]) => onChange(next);

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {field.label}
      </span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              className={inputClass}
              placeholder={field.placeholder || "filename or note"}
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                update(next);
              }}
            />
            <button
              type="button"
              onClick={() => update(items.filter((_, j) => j !== i))}
              className="rounded-lg border border-stone-300 px-3 text-sm text-stone-600 hover:bg-stone-100"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => update([...items, ""])}
        className="mt-2 rounded-lg border border-brand-500 px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
      >
        + Add file
      </button>
    </div>
  );
}

function ExampleListField({ field, value, onChange }: FieldProps) {
  const items: ExamplePair[] = Array.isArray(value)
    ? (value as ExamplePair[])
    : [];

  const update = (next: ExamplePair[]) => onChange(next);

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {field.label}
      </span>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-stone-200 bg-stone-50 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Example {i + 1}
              </span>
              <button
                type="button"
                onClick={() => update(items.filter((_, j) => j !== i))}
                className="text-sm text-stone-500 hover:text-red-600"
                aria-label="Remove example"
              >
                Remove
              </button>
            </div>
            <label className="mb-2 block">
              <span className="mb-1 block text-xs font-medium text-stone-600">
                Input
              </span>
              <textarea
                rows={2}
                className={inputClass + " resize-y font-mono"}
                placeholder="Example input"
                value={item.input ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], input: e.target.value };
                  update(next);
                }}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">
                Ideal output
              </span>
              <textarea
                rows={2}
                className={inputClass + " resize-y font-mono"}
                placeholder="Ideal output"
                value={item.output ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], output: e.target.value };
                  update(next);
                }}
              />
            </label>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => update([...items, { input: "", output: "" }])}
        className="mt-2 rounded-lg border border-brand-500 px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
      >
        + Add example
      </button>
    </div>
  );
}
