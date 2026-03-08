"use client";

import { ChatMessage } from "@/types";
import { Bot, User } from "lucide-react";

interface Props {
  message: ChatMessage;
  onOptionClick?: (option: string) => void;
}

export default function ChatBubble({ message, onOptionClick }: Props) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex gap-3 animate-fade-in-up ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-brand-900/50 border border-brand-700/30 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-brand-400" />
        </div>
      )}

      <div className={`max-w-[80%] ${isAssistant ? "" : "order-first"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAssistant
              ? "bg-surface-lighter border border-surface-border text-text-primary"
              : "bg-brand-600 text-white"
          }`}
        >
          {message.content.split("\n").map((line, i) => {
            const boldMatch = line.match(/\*\*(.+?)\*\*/g);
            if (boldMatch) {
              const parts = line.split(/\*\*(.+?)\*\*/);
              return (
                <p key={i} className={i > 0 ? "mt-1" : ""}>
                  {parts.map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j} className="font-semibold">
                        {part}
                      </strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </p>
              );
            }
            return (
              <p key={i} className={i > 0 ? "mt-1" : ""}>
                {line}
              </p>
            );
          })}
        </div>

        {message.options && message.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.options.map((option) => (
              <button
                key={option}
                onClick={() => onOptionClick?.(option)}
                className="text-xs bg-surface-lighter hover:bg-surface-border border border-surface-border hover:border-brand-600/50 text-text-primary px-3.5 py-2 rounded-full transition font-medium"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-brand-400" />
        </div>
      )}
    </div>
  );
}
