"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  X,
  Plus,
  User,
  Monitor,
  Smartphone,
  Square,
  RectangleVertical,
  Sun,
  Wand2,
  UserCircle,
  Users,
  Loader2,
  Download,
  ImageIcon,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  ZoomIn,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

type Gender = "masculino" | "feminino";
type Position = "esquerda" | "centro" | "direita";
type Dimension = "story" | "horizontal" | "feed" | "retrato";
type Composition = "closeup" | "medium" | "american" | "full";

interface GeneratedResult {
  image: string;
  index: number;
}

// ─── Color Picker Component ─────────────────────────────────────

function ColorPicker({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-surface-lighter flex items-center justify-center text-text-secondary shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
          {label}
        </p>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
        />
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────

function SectionHeader({
  title,
  color = "accent-purple",
}: {
  title: string;
  color?: string;
}) {
  const colorClass =
    color === "accent-orange"
      ? "bg-accent-orange"
      : color === "accent-pink"
      ? "bg-accent-pink"
      : color === "brand-500"
      ? "bg-brand-500"
      : "bg-accent-purple";
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-1 h-5 rounded-full ${colorClass}`} />
      <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider">
        {title}
      </h2>
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-text-primary">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
          checked ? "bg-accent-purple" : "bg-surface-border"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Image Upload Area ───────────────────────────────────────────

function ImageUploadArea({
  images,
  onAdd,
  onRemove,
  label,
  multiple = true,
  required = false,
}: {
  images: string[];
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
  label: string;
  multiple?: boolean;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(i)}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          className="w-16 h-16 border-2 border-dashed border-surface-border rounded-lg flex flex-col items-center justify-center gap-0.5 text-text-muted hover:border-accent-purple hover:text-accent-purple transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[8px] uppercase font-medium">Upload</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onAdd(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE — SIDEBAR LAYOUT
// ═══════════════════════════════════════════════════════════════════

export default function CriarPage() {
  // Sidebar collapse
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Subject
  const [subjectPhotos, setSubjectPhotos] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [gender, setGender] = useState<Gender>("masculino");
  const [poseDescription, setPoseDescription] = useState("");
  const [subjectPosition, setSubjectPosition] = useState<Position>("centro");

  // Dimensions
  const [dimension, setDimension] = useState<Dimension>("retrato");

  // Text
  const [textEnabled, setTextEnabled] = useState(false);
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [cta, setCta] = useState("");
  const [textPosition, setTextPosition] = useState<"top" | "bottom">("bottom");

  // Project & Scene
  const [niche, setNiche] = useState("");
  const [environment, setEnvironment] = useState("");
  const [scenePhotosEnabled, setScenePhotosEnabled] = useState(false);
  const [scenePhotos, setScenePhotos] = useState<string[]>([]);

  // Colors & Lighting
  const [ambientColor, setAmbientColor] = useState("#1a1a2e");
  const [rimLightColor, setRimLightColor] = useState("#c8e600");
  const [fillLightColor, setFillLightColor] = useState("#6366f1");

  // Composition
  const [composition, setComposition] = useState<Composition>("medium");

  // Floating elements
  const [floatingElements, setFloatingElements] = useState(false);

  // References
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // Style
  const [sobriety, setSobriety] = useState(20);
  const [styleEnabled, setStyleEnabled] = useState(true);
  const [styleTag, setStyleTag] = useState("Ultra Realista");
  const [useBlur, setUseBlur] = useState(false);
  const [useGradient, setUseGradient] = useState(false);

  // Additional prompt
  const [additionalPromptEnabled, setAdditionalPromptEnabled] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState("");

  // Generation state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [error, setError] = useState("");

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // ─── Helpers ─────────────────────────────────────────────────────

  const filesToBase64 = useCallback(
    (files: FileList): Promise<string[]> =>
      Promise.all(
        Array.from(files).map(
          (f) =>
            new Promise<string>((resolve) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.readAsDataURL(f);
            })
        )
      ),
    []
  );

  const addSubjectPhotos = async (files: FileList) => {
    const b64 = await filesToBase64(files);
    setSubjectPhotos((p) => [...p, ...b64]);
  };
  const addScenePhotos = async (files: FileList) => {
    const b64 = await filesToBase64(files);
    setScenePhotos((p) => [...p, ...b64]);
  };
  const addReferenceImages = async (files: FileList) => {
    const b64 = await filesToBase64(files);
    setReferenceImages((p) => [...p, ...b64]);
  };

  // ─── Generate ────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (subjectPhotos.length === 0) {
      setError("Adicione pelo menos uma foto do sujeito.");
      return;
    }
    if (!niche.trim()) {
      setError("Preencha o nicho/projeto.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/generate-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectPhotos,
          quantity,
          gender,
          poseDescription,
          subjectPosition,
          dimension,
          textEnabled,
          textOverlay: textEnabled
            ? { headline, subheadline, cta, position: textPosition }
            : undefined,
          niche,
          environment,
          scenePhotos: scenePhotosEnabled ? scenePhotos : [],
          ambientColor,
          rimLightColor,
          fillLightColor,
          composition,
          referenceImages,
          sobriety,
          styleTag: styleEnabled ? styleTag : "",
          useBlur,
          useGradient,
          floatingElements,
          additionalPrompt: additionalPromptEnabled ? additionalPrompt : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na geração");
      setResults(data.images || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (dataUrl: string, index: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `criativo-${index + 1}.png`;
    a.click();
  };

  // ─── Data ────────────────────────────────────────────────────────

  const styleOptions = [
    "Clássico", "Formal", "Elegante", "Sexy", "Institucional", "Tecnológico",
    "Glassmorphism", "Interface UI", "Minimalista", "Lúdico", "Cartoon",
    "Infoproduto", "Jovial", "Gamer", "Retrato Profissional", "Ultra Realista", "Glow",
  ];

  const compositions: { id: Composition; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: "closeup", label: "Close-up (Rosto)", sub: "Foco no enquadramento ideal", icon: <UserCircle className="w-5 h-5" /> },
    { id: "medium", label: "Plano Médio (Busto)", sub: "Foco no enquadramento ideal", icon: <User className="w-5 h-5" /> },
    { id: "american", label: "Plano Americano", sub: "Foco no enquadramento ideal", icon: <Users className="w-5 h-5" /> },
    { id: "full", label: "Corpo Inteiro", sub: "Foco no enquadramento ideal", icon: <Users className="w-5 h-5" /> },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      {/* ─── Top Bar ─── */}
      <nav className="border-b border-surface-border bg-surface/90 backdrop-blur-md shrink-0 z-50">
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-secondary hover:text-text-primary transition p-1"
              title={sidebarOpen ? "Fechar painel" : "Abrir painel"}
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <span className="font-bold text-sm text-text-primary">CriativosAI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs text-text-secondary hover:text-text-primary transition">
              Meus Criativos
            </Link>
            <Link href="/chat" className="text-xs text-text-secondary hover:text-text-primary transition">
              Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Main Layout: Sidebar + Content ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ════════ LEFT SIDEBAR ════════ */}
        <aside
          className={`${
            sidebarOpen ? "w-80 min-w-[320px]" : "w-0 min-w-0"
          } transition-all duration-300 border-r border-surface-border bg-surface-light overflow-hidden shrink-0`}
        >
          <div className="w-80 h-full overflow-y-auto chat-scroll p-4 space-y-6">
            {/* ───── SUJEITO PRINCIPAL ───── */}
            <section>
              <SectionHeader title="Sujeito Principal" />

              <ImageUploadArea
                images={subjectPhotos}
                onAdd={addSubjectPhotos}
                onRemove={(i) => setSubjectPhotos((p) => p.filter((_, idx) => idx !== i))}
                label="Fotos do Sujeito"
                required
              />

              {/* Quantity */}
              <div className="mt-4">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Quantidade</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuantity(n)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition ${
                        quantity === n
                          ? "bg-accent-purple text-white"
                          : "bg-transparent text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="mt-4">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Gênero</p>
                <div className="flex gap-2">
                  {(["masculino", "feminino"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition ${
                        gender === g
                          ? "bg-surface-lighter border border-text-primary text-text-primary"
                          : "bg-transparent text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <span>{g === "masculino" ? "♂" : "♀"}</span>
                      <span className="capitalize">{g}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pose */}
              <div className="mt-4">
                <textarea
                  placeholder="Descrição da pose ou roupa (opcional)..."
                  value={poseDescription}
                  onChange={(e) => setPoseDescription(e.target.value)}
                  className="w-full bg-surface-lighter rounded-xl px-3 py-2.5 text-xs text-text-primary placeholder-text-muted border-0 outline-none resize-y min-h-[60px]"
                />
              </div>

              {/* Position */}
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-2">
                  {(["esquerda", "centro", "direita"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSubjectPosition(pos)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-lg transition ${
                        subjectPosition === pos
                          ? "bg-accent-purple/20 border-2 border-accent-purple"
                          : "bg-surface-lighter border-2 border-transparent"
                      }`}
                    >
                      <div
                        className={`w-6 h-9 rounded ${
                          subjectPosition === pos ? "bg-accent-purple" : "bg-surface-border"
                        }`}
                        style={{
                          marginLeft: pos === "esquerda" ? "-8px" : pos === "direita" ? "8px" : "0",
                        }}
                      />
                      <span className={`text-[9px] font-bold uppercase ${
                        subjectPosition === pos ? "text-accent-purple" : "text-text-muted"
                      }`}>
                        {pos}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ───── DIMENSÕES ───── */}
            <section>
              <SectionHeader title="Dimensões" />
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: "story" as Dimension, label: "Stories (9:16)", icon: <Smartphone className="w-5 h-5" /> },
                  { id: "horizontal" as Dimension, label: "Horizontal (16:9)", icon: <Monitor className="w-5 h-5" /> },
                  { id: "feed" as Dimension, label: "Feed (1:1)", icon: <Square className="w-4 h-4" /> },
                  { id: "retrato" as Dimension, label: "Retrato (4:5)", icon: <RectangleVertical className="w-5 h-5" /> },
                ]).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDimension(d.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-lg transition ${
                      dimension === d.id
                        ? "bg-surface-lighter border border-text-primary text-text-primary"
                        : "bg-transparent text-text-secondary hover:text-text-primary border border-transparent"
                    }`}
                  >
                    {d.icon}
                    <span className="text-[9px] font-semibold uppercase">{d.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* ───── TEXTO ───── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <SectionHeader title="Texto" color="accent-pink" />
                <button
                  onClick={() => setTextEnabled(!textEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                    textEnabled ? "bg-accent-purple" : "bg-surface-border"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    textEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              {textEnabled && (
                <div className="space-y-2 animate-fade-in-up">
                  <input type="text" placeholder="Headline..." value={headline} onChange={(e) => setHeadline(e.target.value)}
                    className="w-full bg-surface-lighter rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted border-0 outline-none" />
                  <input type="text" placeholder="Sub-headline..." value={subheadline} onChange={(e) => setSubheadline(e.target.value)}
                    className="w-full bg-surface-lighter rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted border-0 outline-none" />
                  <input type="text" placeholder="CTA (ex: Saiba Mais)..." value={cta} onChange={(e) => setCta(e.target.value)}
                    className="w-full bg-surface-lighter rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted border-0 outline-none" />
                  <div className="flex gap-2">
                    {(["top", "bottom"] as const).map((pos) => (
                      <button key={pos} onClick={() => setTextPosition(pos)}
                        className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold uppercase transition ${
                          textPosition === pos ? "bg-accent-purple text-white" : "bg-surface-lighter text-text-secondary"
                        }`}>
                        {pos === "top" ? "Topo" : "Rodapé"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ───── PROJETO & CENÁRIO ───── */}
            <section>
              <SectionHeader title="Projeto & Cenário" />
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                    Nicho/Projeto <span className="text-red-500">*</span>
                  </p>
                  <input type="text" placeholder="Ex: Trader de Elite" value={niche} onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-surface-lighter rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted border-0 outline-none" />
                </div>
                <input type="text" placeholder="Ambiente (Ex: Escritório Moderno)" value={environment} onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full bg-surface-lighter rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-muted border-0 outline-none" />
                <ToggleSwitch label="Usar fotos de cenário?" checked={scenePhotosEnabled} onChange={setScenePhotosEnabled} />
                {scenePhotosEnabled && (
                  <div className="animate-fade-in-up">
                    <ImageUploadArea images={scenePhotos} onAdd={addScenePhotos}
                      onRemove={(i) => setScenePhotos((p) => p.filter((_, idx) => idx !== i))} label="Fotos do Cenário" />
                  </div>
                )}
              </div>
            </section>

            {/* ───── CORES & ILUMINAÇÃO ───── */}
            <section>
              <SectionHeader title="Cores & Iluminação" color="accent-orange" />
              <div className="space-y-3">
                <ColorPicker label="Cor do Ambiente" icon={<ImageIcon className="w-4 h-4" />} value={ambientColor} onChange={setAmbientColor} />
                <ColorPicker label="Luz de Recorte" icon={<Sun className="w-4 h-4" />} value={rimLightColor} onChange={setRimLightColor} />
                <ColorPicker label="Luz Complementar" icon={<Wand2 className="w-4 h-4" />} value={fillLightColor} onChange={setFillLightColor} />
              </div>
            </section>

            {/* ───── COMPOSIÇÃO ───── */}
            <section>
              <SectionHeader title="Composição" color="brand-500" />
              <div className="space-y-2">
                {compositions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setComposition(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition text-left ${
                      composition === c.id
                        ? "bg-gradient-to-r from-accent-purple/80 to-accent-purple/40 border border-accent-purple"
                        : "bg-surface-lighter border border-surface-border hover:border-text-muted"
                    }`}
                  >
                    <div className={composition === c.id ? "text-white" : "text-text-muted"}>{c.icon}</div>
                    <div>
                      <p className={`text-xs font-bold ${composition === c.id ? "text-white" : "text-text-primary"}`}>{c.label}</p>
                      <p className={`text-[10px] ${composition === c.id ? "text-white/70" : "text-text-muted"}`}>{c.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* ───── TOGGLES ───── */}
            <section>
              <ToggleSwitch label="Elementos Flutuantes?" checked={floatingElements} onChange={setFloatingElements} />
            </section>

            {/* ───── REFERÊNCIAS DE ESTILO ───── */}
            <section className="border border-surface-border rounded-xl p-4">
              <h3 className="text-[10px] font-bold text-text-primary uppercase tracking-wider mb-3">Referências de Estilo</h3>
              <ImageUploadArea images={referenceImages} onAdd={addReferenceImages}
                onRemove={(i) => setReferenceImages((p) => p.filter((_, idx) => idx !== i))} label="Adicionar Referência" />
            </section>

            {/* ───── ATRIBUTOS VISUAIS & ESTILO ───── */}
            <section className="border border-surface-border rounded-xl p-4">
              <h3 className="text-[10px] font-bold text-text-primary uppercase tracking-wider mb-4">Atributos Visuais & Estilo</h3>

              {/* Sobriety slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-text-primary">Sobriedade</span>
                  <span className="text-xs font-bold text-accent-purple">
                    {sobriety}{" "}
                    <span className="text-text-secondary font-normal text-[10px]">
                      {sobriety <= 30 ? "Criativo / Vibrante" : sobriety <= 60 ? "Equilibrado" : "Profissional"}
                    </span>
                  </span>
                </div>
                <input type="range" min={0} max={100} value={sobriety}
                  onChange={(e) => setSobriety(Number(e.target.value))} className="w-full accent-accent-purple" />
                <div className="flex justify-between text-[9px] text-text-muted mt-0.5">
                  <span>Criativo</span><span>Profissional</span>
                </div>
              </div>

              <div className="border-t border-surface-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-text-primary uppercase">Ativar Estilo Visual</span>
                  <button onClick={() => setStyleEnabled(!styleEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                      styleEnabled ? "bg-accent-purple" : "bg-surface-border"
                    }`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      styleEnabled ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
                {styleEnabled && (
                  <div className="flex flex-wrap gap-1.5 animate-fade-in-up">
                    {styleOptions.map((s) => (
                      <button key={s} onClick={() => setStyleTag(s)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition ${
                          styleTag === s
                            ? "bg-accent-purple text-white"
                            : "bg-transparent border border-surface-border text-text-secondary hover:text-text-primary hover:border-text-muted"
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-surface-border mt-4 pt-3">
                <ToggleSwitch label="Usar Desfoque (Blur)?" checked={useBlur} onChange={setUseBlur} />
                <ToggleSwitch label="Usar Degradê Lateral?" checked={useGradient} onChange={setUseGradient} />
              </div>
            </section>

            {/* ───── PROMPT ADICIONAL ───── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Prompt Adicional</h3>
                <button onClick={() => setAdditionalPromptEnabled(!additionalPromptEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                    additionalPromptEnabled ? "bg-accent-purple" : "bg-surface-border"
                  }`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    additionalPromptEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
              {additionalPromptEnabled && (
                <textarea placeholder="Instruções adicionais para a IA..."
                  value={additionalPrompt} onChange={(e) => setAdditionalPrompt(e.target.value)}
                  className="w-full bg-surface-lighter rounded-xl px-3 py-2.5 text-xs text-text-primary placeholder-text-muted border-0 outline-none resize-y min-h-[70px] animate-fade-in-up" />
              )}
            </section>

            {/* ───── ERROR ───── */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* ───── GENERATE BUTTON ───── */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-purple to-brand-600 hover:from-accent-purple/90 hover:to-brand-700 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 sticky bottom-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando {quantity} criativo{quantity > 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar {quantity} Criativo{quantity > 1 ? "s" : ""}
                </>
              )}
            </button>

            <div className="h-4" />
          </div>
        </aside>

        {/* ════════ MAIN CONTENT AREA (RIGHT) ════════ */}
        <main className="flex-1 overflow-y-auto bg-surface">
          {results.length === 0 && !loading ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-2xl bg-surface-lighter flex items-center justify-center mb-6">
                <ImageIcon className="w-10 h-10 text-text-muted" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Seus criativos aparecerão aqui
              </h2>
              <p className="text-sm text-text-secondary max-w-md">
                Configure as opções no painel à esquerda e clique em <strong className="text-accent-purple">Gerar</strong> para criar seus criativos profissionais com IA.
              </p>
            </div>
          ) : loading ? (
            /* Loading state */
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-2xl bg-accent-purple/10 flex items-center justify-center mb-6 pulse-glow">
                <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Gerando {quantity} criativo{quantity > 1 ? "s" : ""}...
              </h2>
              <p className="text-sm text-text-secondary">
                A IA está trabalhando na sua imagem. Isso pode levar alguns segundos.
              </p>
            </div>
          ) : (
            /* Results */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-accent-purple" />
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                    Resultados ({results.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((r) => (
                  <div
                    key={r.index}
                    className="relative group rounded-2xl overflow-hidden border border-surface-border bg-surface-light"
                  >
                    <img
                      src={r.image}
                      alt={`Criativo ${r.index + 1}`}
                      className="w-full cursor-pointer"
                      onClick={() => setLightboxImage(r.image)}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button
                        onClick={() => setLightboxImage(r.image)}
                        className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition"
                      >
                        <ZoomIn className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => downloadImage(r.image, r.index)}
                        className="bg-white text-black px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── Lightbox ─── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
