import { BriefingData } from "@/types";

interface ColorScheme {
  bg: string;
  bgGradient: string;
  accent: string;
  text: string;
  textSecondary: string;
  ctaBg: string;
  ctaText: string;
}

const colorSchemes: Record<string, ColorScheme> = {
  "Azul e Branco": {
    bg: "#0a1628",
    bgGradient: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 100%)",
    accent: "#3b82f6",
    text: "#ffffff",
    textSecondary: "#93c5fd",
    ctaBg: "#3b82f6",
    ctaText: "#ffffff",
  },
  "Preto e Dourado": {
    bg: "#0a0a0a",
    bgGradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    accent: "#d4a843",
    text: "#ffffff",
    textSecondary: "#d4a843",
    ctaBg: "#d4a843",
    ctaText: "#000000",
  },
  "Vermelho e Preto": {
    bg: "#0a0000",
    bgGradient: "linear-gradient(135deg, #1a0000 0%, #2d0000 100%)",
    accent: "#ef4444",
    text: "#ffffff",
    textSecondary: "#fca5a5",
    ctaBg: "#ef4444",
    ctaText: "#ffffff",
  },
  "Verde e Branco": {
    bg: "#001a0a",
    bgGradient: "linear-gradient(135deg, #001a0a 0%, #003d1a 100%)",
    accent: "#22c55e",
    text: "#ffffff",
    textSecondary: "#86efac",
    ctaBg: "#22c55e",
    ctaText: "#ffffff",
  },
  "Roxo e Rosa": {
    bg: "#0f001a",
    bgGradient: "linear-gradient(135deg, #1a0033 0%, #330033 100%)",
    accent: "#a855f7",
    text: "#ffffff",
    textSecondary: "#e879f9",
    ctaBg: "linear-gradient(90deg, #a855f7, #ec4899)",
    ctaText: "#ffffff",
  },
  "Laranja e Amarelo": {
    bg: "#1a0f00",
    bgGradient: "linear-gradient(135deg, #1a0f00 0%, #2d1a00 100%)",
    accent: "#f59e0b",
    text: "#ffffff",
    textSecondary: "#fcd34d",
    ctaBg: "linear-gradient(90deg, #f59e0b, #ef4444)",
    ctaText: "#ffffff",
  },
};

function getColors(briefing: BriefingData): ColorScheme {
  const colorKey = briefing.colors?.[0] || "Azul e Branco";
  return colorSchemes[colorKey] || colorSchemes["Azul e Branco"];
}

function getHeadlines(briefing: BriefingData): string[] {
  const { productName, headline, productType } = briefing;
  const h = headline || productName;
  return [
    h.toUpperCase(),
    `${productName}`,
    `O ${productType} que vai transformar seus resultados`,
    `Descubra como ${h.toLowerCase()}`,
    `Chegou a hora de ${h.toLowerCase()}`,
    `Pare de perder tempo. Comece a ${h.toLowerCase()}`,
  ];
}

function getSubheadlines(briefing: BriefingData): string[] {
  const { targetAudience, additionalInfo, subheadline } = briefing;
  const base = [
    subheadline || `Feito especialmente para ${targetAudience.toLowerCase()}`,
    `Método comprovado por centenas de alunos`,
    `Vagas limitadas — garanta a sua agora`,
    `Resultados reais em tempo recorde`,
  ];
  if (additionalInfo && additionalInfo.toLowerCase() !== "não") {
    base.push(additionalInfo);
  }
  return base;
}

export interface TemplateData {
  style: string;
  colors: ColorScheme;
  headline: string;
  subheadline: string;
  cta: string;
  productName: string;
  productType: string;
  additionalInfo: string;
}

export function generateTemplateVariants(briefing: BriefingData): TemplateData[] {
  const colors = getColors(briefing);
  const headlines = getHeadlines(briefing);
  const subheadlines = getSubheadlines(briefing);
  const styles = ["bold", "minimal", "gradient", "split", "dark-premium", "neon"];

  return styles.map((style, i) => ({
    style,
    colors,
    headline: headlines[i % headlines.length],
    subheadline: subheadlines[i % subheadlines.length],
    cta: briefing.cta,
    productName: briefing.productName,
    productType: briefing.productType,
    additionalInfo: briefing.additionalInfo,
  }));
}

export function renderCreativeHTML(
  template: TemplateData,
  width: number,
  height: number
): string {
  const { style, colors, headline, subheadline, cta, productName } = template;
  const scale = Math.min(width, height) / 400;
  const headlineSize = Math.round(28 * scale);
  const subSize = Math.round(14 * scale);
  const ctaSize = Math.round(14 * scale);
  const nameSize = Math.round(11 * scale);
  const ctaPadV = Math.round(10 * scale);
  const ctaPadH = Math.round(28 * scale);

  const decorations: Record<string, string> = {
    bold: `
      <div style="position:absolute;top:0;left:0;right:0;height:${Math.round(6 * scale)}px;background:${colors.accent};"></div>
      <div style="position:absolute;bottom:${Math.round(60 * scale)}px;left:${Math.round(30 * scale)}px;width:${Math.round(50 * scale)}px;height:${Math.round(4 * scale)}px;background:${colors.accent};border-radius:2px;"></div>
    `,
    minimal: `
      <div style="position:absolute;top:${Math.round(20 * scale)}px;right:${Math.round(20 * scale)}px;width:${Math.round(40 * scale)}px;height:${Math.round(40 * scale)}px;border:2px solid ${colors.accent};border-radius:50%;opacity:0.3;"></div>
    `,
    gradient: `
      <div style="position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(to top, ${colors.accent}33, transparent);"></div>
    `,
    split: `
      <div style="position:absolute;top:0;right:0;width:35%;height:100%;background:${colors.accent};opacity:0.1;"></div>
      <div style="position:absolute;top:0;right:35%;width:${Math.round(4 * scale)}px;height:100%;background:${colors.accent};"></div>
    `,
    "dark-premium": `
      <div style="position:absolute;top:${Math.round(15 * scale)}px;left:${Math.round(15 * scale)}px;right:${Math.round(15 * scale)}px;bottom:${Math.round(15 * scale)}px;border:1px solid ${colors.accent}44;border-radius:${Math.round(8 * scale)}px;"></div>
      <div style="position:absolute;top:${Math.round(20 * scale)}px;left:50%;transform:translateX(-50%);width:${Math.round(30 * scale)}px;height:${Math.round(2 * scale)}px;background:${colors.accent};"></div>
    `,
    neon: `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${Math.round(200 * scale)}px;height:${Math.round(200 * scale)}px;border-radius:50%;background:${colors.accent};opacity:0.07;filter:blur(${Math.round(60 * scale)}px);"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:${Math.round(3 * scale)}px;background:${colors.accent};box-shadow:0 0 ${Math.round(15 * scale)}px ${colors.accent};"></div>
    `,
  };

  return `
    <div style="
      width:${width}px;
      height:${height}px;
      background:${colors.bgGradient};
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:${style === "split" ? "flex-start" : "center"};
      padding:${Math.round(30 * scale)}px;
      position:relative;
      overflow:hidden;
      font-family:'Inter',system-ui,-apple-system,sans-serif;
      box-sizing:border-box;
    ">
      ${decorations[style] || ""}

      <div style="position:relative;z-index:1;text-align:${style === "split" ? "left" : "center"};max-width:${style === "split" ? "60%" : "90%"};">
        <div style="
          font-size:${nameSize}px;
          color:${colors.accent};
          text-transform:uppercase;
          letter-spacing:${Math.round(3 * scale)}px;
          margin-bottom:${Math.round(12 * scale)}px;
          font-weight:600;
        ">${productName}</div>

        <h1 style="
          font-size:${headlineSize}px;
          font-weight:800;
          color:${colors.text};
          line-height:1.15;
          margin:0 0 ${Math.round(12 * scale)}px 0;
          ${style === "neon" ? `text-shadow: 0 0 ${Math.round(20 * scale)}px ${colors.accent}55;` : ""}
        ">${headline}</h1>

        <p style="
          font-size:${subSize}px;
          color:${colors.textSecondary};
          line-height:1.5;
          margin:0 0 ${Math.round(22 * scale)}px 0;
          opacity:0.9;
        ">${subheadline}</p>

        <div style="
          display:inline-block;
          background:${colors.ctaBg};
          color:${colors.ctaText};
          font-size:${ctaSize}px;
          font-weight:700;
          padding:${ctaPadV}px ${ctaPadH}px;
          border-radius:${Math.round(6 * scale)}px;
          text-transform:uppercase;
          letter-spacing:${Math.round(1 * scale)}px;
          ${style === "neon" ? `box-shadow: 0 0 ${Math.round(20 * scale)}px ${colors.accent}66;` : ""}
        ">${cta}</div>
      </div>
    </div>
  `;
}

export { colorSchemes };
