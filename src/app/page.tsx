"use client";

import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  Image,
  Download,
  Zap,
  Target,
  Palette,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-500" />
            <span className="font-bold text-lg text-text-primary">
              CriativosAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-text-secondary hover:text-text-primary transition"
            >
              Meus Criativos
            </Link>
            <Link
              href="/chat"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Criar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-brand-900)_0%,_transparent_70%)] opacity-20" />
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-brand-900/30 border border-brand-700/30 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs text-brand-300 font-medium">
                Geração inteligente de criativos
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-tight mb-6">
              Crie criativos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-purple">
                profissionais
              </span>{" "}
              em minutos
            </h1>
            <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
              Responda algumas perguntas e gere automaticamente dezenas de
              criativos otimizados para Instagram, Facebook, YouTube e mais.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base"
              >
                Começar Agora
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-surface-lighter hover:bg-surface-border text-text-secondary font-medium px-8 py-3.5 rounded-xl border border-surface-border transition text-base"
              >
                Ver Exemplos
              </Link>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-surface-light rounded-2xl border border-surface-border p-1.5 shadow-2xl">
              <div className="bg-surface rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Feed", color: "from-brand-500 to-brand-700", w: "1:1" },
                  { label: "Story", color: "from-accent-purple to-accent-pink", w: "9:16" },
                  { label: "Banner", color: "from-accent-orange to-red-500", w: "16:9" },
                  { label: "YouTube", color: "from-accent-green to-teal-500", w: "16:9" },
                ].map((item) => (
                  <div key={item.label} className="group">
                    <div
                      className={`bg-gradient-to-br ${item.color} rounded-lg aspect-square flex items-center justify-center opacity-60 group-hover:opacity-100 transition`}
                    >
                      <div className="text-center text-white">
                        <Image className="w-8 h-8 mx-auto mb-2 opacity-70" />
                        <p className="text-xs font-medium opacity-80">
                          {item.label}
                        </p>
                        <p className="text-[10px] opacity-50">{item.w}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-surface-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-text-primary mb-4">
            Como funciona
          </h2>
          <p className="text-text-secondary text-center mb-14 max-w-lg mx-auto">
            Em 3 passos simples, você gera criativos profissionais prontos para
            usar nas suas campanhas.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "1. Converse com a IA",
                desc: "Responda perguntas simples sobre seu produto, público e estilo. O chat guia todo o processo.",
              },
              {
                icon: Palette,
                title: "2. Geração Automática",
                desc: "O sistema cria múltiplas variações de criativos em diferentes formatos e estilos.",
              },
              {
                icon: Download,
                title: "3. Baixe e Use",
                desc: "Visualize todos os criativos, escolha seus favoritos e baixe em alta qualidade.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-light border border-surface-border rounded-xl p-6 hover:border-brand-700/50 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="py-20 border-t border-surface-border">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-text-primary mb-4">
            Formatos disponíveis
          </h2>
          <p className="text-text-secondary text-center mb-14 max-w-lg mx-auto">
            Cada criativo é gerado em todos os formatos que você precisa.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Feed Instagram", size: "1080×1080", icon: Target },
              { label: "Story / Reels", size: "1080×1920", icon: Zap },
              { label: "Banner Facebook", size: "1200×628", icon: Image },
              { label: "Banner YouTube", size: "1280×720", icon: Sparkles },
            ].map((f) => (
              <div
                key={f.label}
                className="bg-surface-light border border-surface-border rounded-xl p-5 text-center hover:border-brand-700/50 transition"
              >
                <f.icon className="w-8 h-8 text-brand-500 mx-auto mb-3" />
                <p className="font-semibold text-text-primary text-sm">
                  {f.label}
                </p>
                <p className="text-xs text-text-muted mt-1">{f.size}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-surface-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Pronto para criar seus criativos?
          </h2>
          <p className="text-text-secondary mb-8">
            Comece agora mesmo — é rápido, fácil e gratuito para testar.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-10 py-4 rounded-xl transition text-lg"
          >
            <Sparkles className="w-5 h-5" />
            Criar Meus Criativos
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-semibold text-text-secondary">
              CriativosAI
            </span>
          </div>
          <p className="text-xs text-text-muted">
            &copy; 2026 CriativosAI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
