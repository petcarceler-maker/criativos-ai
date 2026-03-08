"use client";

import { useState, useRef } from "react";
import { Wand2, Upload, X, Copy, Check, Loader2, ChevronDown } from "lucide-react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PromptExtractor() {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const base64 = await fileToBase64(file);
    setImage(base64);
    setPrompt(null);
    setError(null);

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleExtract = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    setPrompt(null);

    try {
      const res = await fetch("/api/extract-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || `Erro ${res.status}`);
      }

      const data = await res.json();
      setPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPrompt(null);
    setError(null);
    setCopied(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] flex items-center gap-2 bg-gradient-to-b from-violet-500 to-purple-700 hover:from-violet-400 hover:to-purple-600 text-white px-3 py-3 rounded-l-xl shadow-lg shadow-purple-900/40 transition-all duration-200 group"
        style={{ writingMode: isOpen ? undefined : "vertical-lr" }}
      >
        <Wand2 className={`w-4 h-4 ${isOpen ? "" : "rotate-90"}`} />
        <span className="text-xs font-bold tracking-wide whitespace-nowrap">
          EXTRATOR DE PROMPT
        </span>
        {isOpen && <ChevronDown className="w-3 h-3 rotate-90 opacity-60" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-[380px] z-[55] bg-surface border-l border-surface-border shadow-2xl shadow-black/40 flex flex-col animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-bold text-text-primary">Extrator de Prompt</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <p className="text-xs text-text-secondary leading-relaxed">
              Envie uma imagem de referência e a IA vai extrair o prompt visual completo. Depois, copie e cole no campo de prompt personalizado do chat.
            </p>

            {/* Image upload / preview */}
            {!image ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-surface-border hover:border-violet-500/50 bg-surface-lighter/50 flex flex-col items-center justify-center gap-3 transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition">
                  <Upload className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-text-primary">Enviar imagem</p>
                  <p className="text-xs text-text-muted mt-0.5">JPG, PNG, WebP</p>
                </div>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={image}
                  alt="Referência"
                  className="w-full rounded-xl border border-surface-border object-cover max-h-52"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />

            {/* Extract button */}
            {image && !prompt && !isLoading && (
              <button
                onClick={handleExtract}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
              >
                <Wand2 className="w-4 h-4" />
                Extrair Prompt
              </button>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-6">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                <span className="text-sm text-text-secondary">Analisando imagem...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-xs text-red-400">{error}</p>
                <button
                  onClick={handleExtract}
                  className="text-xs text-red-300 underline mt-1"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Result */}
            {prompt && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Prompt Extraído</p>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                      copied
                        ? "bg-green-500/20 text-green-400"
                        : "bg-surface-lighter hover:bg-surface-border text-text-secondary"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-surface-lighter border border-surface-border rounded-xl p-4 max-h-64 overflow-y-auto">
                  <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap select-all">
                    {prompt}
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full text-xs text-text-muted hover:text-text-secondary py-2 transition"
                >
                  Extrair de outra imagem
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
