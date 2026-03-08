"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import { GeneratedImage, TextOverlay } from "@/types";
import { applyTextOverlay } from "@/lib/canvas-overlay";

interface CreativeEditorProps {
  creative: GeneratedImage;
  onClose: () => void;
  onSave: (updated: GeneratedImage) => void;
}

export default function CreativeEditor({ creative, onClose, onSave }: CreativeEditorProps) {
  const [headline, setHeadline] = useState(creative.textOverlay.headline);
  const [subheadline, setSubheadline] = useState(creative.textOverlay.subheadline);
  const [cta, setCta] = useState(creative.textOverlay.cta);
  const [textPosition, setTextPosition] = useState<"top" | "bottom">(creative.textOverlay.textPosition);
  const [previewImage, setPreviewImage] = useState(creative.image);
  const [isRendering, setIsRendering] = useState(false);

  const renderPreview = useCallback(async () => {
    setIsRendering(true);
    try {
      const overlay: TextOverlay = { headline, subheadline, cta, textPosition };
      const result = await applyTextOverlay(creative.baseImage, overlay, creative.format);
      setPreviewImage(result);
    } catch (err) {
      console.error("Erro ao renderizar preview:", err);
    }
    setIsRendering(false);
  }, [headline, subheadline, cta, textPosition, creative.baseImage, creative.format]);

  useEffect(() => {
    const timeout = setTimeout(renderPreview, 300);
    return () => clearTimeout(timeout);
  }, [renderPreview]);

  const handleSave = () => {
    onSave({
      ...creative,
      image: previewImage,
      textOverlay: { headline, subheadline, cta, textPosition },
    });
  };

  const handleDownload = () => {
    try {
      const byteString = atob(previewImage.split(",")[1]);
      const mimeType = previewImage.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${creative.styleLabel}-${creative.format}-edited.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      const link = document.createElement("a");
      link.download = `${creative.styleLabel}-${creative.format}-edited.png`;
      link.href = previewImage;
      link.click();
    }
  };

  const handleReset = () => {
    setHeadline(creative.textOverlay.headline);
    setSubheadline(creative.textOverlay.subheadline);
    setCta(creative.textOverlay.cta);
    setTextPosition(creative.textOverlay.textPosition);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-light border border-surface-border rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview */}
        <div className="flex-1 bg-black/30 flex items-center justify-center p-4 min-h-[300px]">
          <img
            src={previewImage}
            alt="Preview"
            className={`max-w-full max-h-[70vh] object-contain rounded-lg transition-opacity ${isRendering ? "opacity-60" : "opacity-100"}`}
          />
        </div>

        {/* Editor Panel */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-surface-border p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Editar Criativo</h3>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Headline */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600/50 transition"
              placeholder="Título principal..."
            />
          </div>

          {/* Subheadline */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Subheadline</label>
            <input
              type="text"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600/50 transition"
              placeholder="Subtítulo..."
            />
          </div>

          {/* CTA */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Botão CTA</label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-600/50 transition"
              placeholder="Texto do botão..."
            />
          </div>

          {/* Text Position */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1 block">Posição do Texto</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTextPosition("top")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition ${
                  textPosition === "top"
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "bg-surface border-surface-border text-text-secondary hover:border-brand-600/50"
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Superior
              </button>
              <button
                onClick={() => setTextPosition("bottom")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition ${
                  textPosition === "bottom"
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "bg-surface border-surface-border text-text-secondary hover:border-brand-600/50"
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                Inferior
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-surface/50 border border-surface-border rounded-lg p-3">
            <p className="text-xs text-text-muted">
              <strong className="text-text-secondary">Formato:</strong> {creative.format} &bull;{" "}
              <strong className="text-text-secondary">Estilo:</strong> {creative.styleLabel}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-auto pt-2">
            <button
              onClick={handleSave}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition text-sm"
            >
              Salvar Alterações
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 bg-surface border border-surface-border hover:border-brand-600/50 text-text-primary py-2 rounded-lg transition text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 bg-surface border border-surface-border hover:border-brand-600/50 text-text-primary py-2 rounded-lg transition text-xs font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
