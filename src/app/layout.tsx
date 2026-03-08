import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CriativosAI — Geração de Criativos para Marketing Digital",
  description:
    "Crie criativos profissionais para Instagram, Facebook, YouTube e mais. Geração automática com IA para lançamentos e marketing digital.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
