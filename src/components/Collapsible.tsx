"use client";

import { useState } from "react";

export function Collapsible({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-stone-50"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span
          className={
            "text-stone-400 transition-transform " + (open ? "rotate-180" : "")
          }
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-stone-200 px-4 py-3 text-sm text-stone-600">
          {children}
        </div>
      )}
    </div>
  );
}
