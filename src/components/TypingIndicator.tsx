"use client";

import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full bg-brand-900/50 border border-brand-700/30 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-brand-400" />
      </div>
      <div className="bg-surface-lighter border border-surface-border rounded-2xl px-4 py-3">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-text-muted typing-dot" />
          <div className="w-2 h-2 rounded-full bg-text-muted typing-dot" />
          <div className="w-2 h-2 rounded-full bg-text-muted typing-dot" />
        </div>
      </div>
    </div>
  );
}
