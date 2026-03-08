"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Filter,
  Trash2,
  LayoutGrid,
  List,
  Download,
  Eye,
  Pencil,
  X,
} from "lucide-react";
import { GeneratedImage } from "@/types";
import CreativeEditor from "@/components/CreativeEditor";
import { loadCreatives, clearCreatives, updateCreative, migrateFromLocalStorage } from "@/lib/image-store";

type FormatFilter = "all" | "feed" | "story" | "banner" | "wide";

const formatLabels: Record<string, string> = {
  feed: "Feed Instagram",
  story: "Story/Reels",
  banner: "Banner Facebook",
  wide: "Banner YouTube",
};

export default function DashboardPage() {
  const [creatives, setCreatives] = useState<GeneratedImage[]>([]);
  const [filter, setFilter] = useState<FormatFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loaded, setLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    (async () => {
      await migrateFromLocalStorage();
      const data = await loadCreatives();
      setCreatives(data);
      setLoaded(true);
    })();
  }, []);

  const filtered =
    filter === "all" ? creatives : creatives.filter((c) => c.format === filter);

  const styles = [...new Set(creatives.map((c) => c.styleLabel))];
  const formats = [...new Set(creatives.map((c) => c.format))];

  const handleClear = async () => {
    if (confirm("Tem certeza que deseja apagar todos os criativos?")) {
      await clearCreatives();
      setCreatives([]);
    }
  };

  const handleDownload = (creative: GeneratedImage) => {
    try {
      // Convert data URL to Blob for reliable download of large images
      const byteString = atob(creative.image.split(",")[1]);
      const mimeType = creative.image.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${creative.styleLabel}-${creative.format}-${creative.id}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Fallback to direct data URL
      const link = document.createElement("a");
      link.download = `${creative.styleLabel}-${creative.format}-${creative.id}.png`;
      link.href = creative.image;
      link.click();
    }
  };

  const handleSaveEdit = async (updated: GeneratedImage) => {
    const newCreatives = creatives.map((c) =>
      c.id === updated.id ? updated : c
    );
    setCreatives(newCreatives);
    await updateCreative(updated);
    setEditingImage(null);
  };

  const filterButtons: { value: FormatFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "feed", label: "Feed" },
    { value: "story", label: "Story" },
    { value: "banner", label: "Banner FB" },
    { value: "wide", label: "YouTube" },
  ];

  if (!loaded) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-secondary">
          <Sparkles className="w-5 h-5 animate-spin text-brand-500" />
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-text-primary">CriativosAI</span>
          </Link>
          <div className="flex items-center gap-3">
            {creatives.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-text-muted hover:text-red-400 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
            <Link
              href="/chat"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Novo Criativo
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {creatives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 rounded-2xl bg-surface-lighter border border-surface-border flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-text-muted" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Nenhum criativo ainda
            </h2>
            <p className="text-text-secondary mb-8 text-center max-w-sm">
              Inicie uma conversa com a IA para gerar seus primeiros criativos
              profissionais para marketing digital.
            </p>
            <Link
              href="/chat"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Criativo
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface-light border border-surface-border rounded-xl p-4">
                <p className="text-xs text-text-muted mb-1">Total de Criativos</p>
                <p className="text-2xl font-bold text-brand-400">{creatives.length}</p>
              </div>
              <div className="bg-surface-light border border-surface-border rounded-xl p-4">
                <p className="text-xs text-text-muted mb-1">Estilos Usados</p>
                <p className="text-2xl font-bold text-accent-purple">{styles.length}</p>
              </div>
              <div className="bg-surface-light border border-surface-border rounded-xl p-4">
                <p className="text-xs text-text-muted mb-1">Formatos</p>
                <p className="text-2xl font-bold text-accent-green">{formats.length}</p>
              </div>
              <div className="bg-surface-light border border-surface-border rounded-xl p-4">
                <p className="text-xs text-text-muted mb-1">Gerados com IA</p>
                <p className="text-2xl font-bold text-accent-orange">{creatives.length}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-text-muted" />
                {filterButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setFilter(btn.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                      filter === btn.value
                        ? "bg-brand-600 border-brand-600 text-white"
                        : "bg-surface-lighter border-surface-border text-text-secondary hover:border-brand-600/50"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-surface-lighter border border-surface-border rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition ${
                    viewMode === "grid"
                      ? "bg-surface-border text-text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition ${
                    viewMode === "list"
                      ? "bg-surface-border text-text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid por estilo */}
            {viewMode === "grid" ? (
              <div className="space-y-10">
                {styles.map((styleName) => {
                  const styleCreatives = filtered.filter(
                    (c) => c.styleLabel === styleName
                  );
                  if (styleCreatives.length === 0) return null;

                  return (
                    <div key={styleName}>
                      <h3 className="text-sm font-semibold text-text-secondary mb-4">
                        Estilo:{" "}
                        <span className="text-brand-400">{styleName}</span>
                        <span className="text-text-muted font-normal ml-2">
                          ({styleCreatives.length} criativos)
                        </span>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {styleCreatives.map((creative) => (
                          <div
                            key={creative.id}
                            className="group relative rounded-xl overflow-hidden border border-surface-border bg-surface-light hover:border-brand-600/50 transition"
                          >
                            <img
                              src={creative.image}
                              alt={`${creative.styleLabel} - ${creative.format}`}
                              className="w-full aspect-square object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() => setSelectedImage(creative)}
                                className="bg-white text-black rounded-full p-2.5 hover:scale-110 transition"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {creative.baseImage && (
                                <button
                                  onClick={() => setEditingImage(creative)}
                                  className="bg-brand-600 text-white rounded-full p-2.5 hover:scale-110 transition"
                                  title="Editar texto"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(creative)}
                                className="bg-white text-black rounded-full p-2.5 hover:scale-110 transition"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-medium text-text-primary">
                                {formatLabels[creative.format] || creative.format}
                              </p>
                              <p className="text-xs text-text-muted mt-0.5">
                                {creative.styleLabel}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((creative) => (
                  <div
                    key={creative.id}
                    className="flex items-center gap-4 bg-surface-light border border-surface-border rounded-xl p-3 hover:border-brand-600/30 transition"
                  >
                    <img
                      src={creative.image}
                      alt={creative.styleLabel}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">
                        {creative.styleLabel} — {formatLabels[creative.format] || creative.format}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {creative.textOverlay?.headline || creative.prompt.slice(0, 80)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedImage(creative)}
                        className="p-2 rounded-lg hover:bg-surface-border text-text-muted hover:text-text-primary transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {creative.baseImage && (
                        <button
                          onClick={() => setEditingImage(creative)}
                          className="p-2 rounded-lg hover:bg-surface-border text-text-muted hover:text-brand-400 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(creative)}
                        className="p-2 rounded-lg hover:bg-surface-border text-text-muted hover:text-text-primary transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.image}
              alt={selectedImage.styleLabel}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {selectedImage.styleLabel} — {formatLabels[selectedImage.format]}
                </p>
                {selectedImage.textOverlay && (
                  <p className="text-white/50 text-xs mt-1">
                    {selectedImage.textOverlay.headline} | {selectedImage.textOverlay.subheadline}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedImage.baseImage && (
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setEditingImage(selectedImage);
                    }}
                    className="bg-surface-lighter hover:bg-surface-border text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                )}
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      {editingImage && (
        <CreativeEditor
          creative={editingImage}
          onClose={() => setEditingImage(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
