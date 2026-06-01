import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Builder — Anthropic 10-element wizard",
  description:
    "A step-by-step wizard for composing high-quality prompts using Anthropic's 10-element prompt structure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
