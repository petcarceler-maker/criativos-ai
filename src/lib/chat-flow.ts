import { ChatStep } from "@/types";

interface StepConfig {
  message: string;
  options?: string[];
  field?: string;
  multiSelect?: boolean;
  nextStep: ChatStep;
}

export const chatSteps: Record<ChatStep, StepConfig> = {
  welcome: {
    message:
      "Olá! Sou o CriativosAI, seu assistente de criação de peças para marketing digital com IA generativa. Vou te ajudar a criar criativos profissionais em poucos minutos. Vamos começar?",
    options: ["Vamos lá!", "Como funciona?"],
    nextStep: "productName",
  },
  productName: {
    message:
      "Qual é o nome do seu produto ou serviço? (Ex: Curso de Marketing Digital, Mentoria de Vendas, E-book de Receitas...)",
    field: "productName",
    nextStep: "productType",
  },
  productType: {
    message: "Qual o tipo do seu produto?",
    options: [
      "Curso Online",
      "Mentoria",
      "E-book",
      "Software/SaaS",
      "Produto Físico",
      "Serviço",
      "Evento/Workshop",
      "Outro",
    ],
    field: "productType",
    nextStep: "targetAudience",
  },
  targetAudience: {
    message:
      "Quem é o público-alvo? Descreva brevemente (Ex: empreendedores iniciantes, mães que trabalham de casa, profissionais de TI...)",
    field: "targetAudience",
    nextStep: "mainBenefit",
  },
  mainBenefit: {
    message:
      "Qual o principal benefício ou transformação que seu produto oferece? (Ex: Faturar 10k/mês, Perder 10kg em 30 dias, Dominar inglês em 6 meses...)",
    field: "mainBenefit",
    nextStep: "tone",
  },
  tone: {
    message: "Qual tom de comunicação você prefere?",
    options: [
      "Profissional e Sério",
      "Descontraído e Jovem",
      "Urgente e Persuasivo",
      "Luxuoso e Premium",
      "Motivacional e Inspirador",
    ],
    field: "tone",
    nextStep: "colors",
  },
  colors: {
    message: "Quais cores combinam com sua marca?",
    options: [
      "Azul e Branco",
      "Preto e Dourado",
      "Vermelho e Preto",
      "Verde e Branco",
      "Roxo e Rosa",
      "Laranja e Amarelo",
    ],
    field: "colors",
    nextStep: "cta",
  },
  cta: {
    message: "Qual a chamada para ação (CTA) principal?",
    options: [
      "Compre Agora",
      "Inscreva-se Grátis",
      "Garanta sua Vaga",
      "Saiba Mais",
      "Baixe Agora",
      "Comece Hoje",
    ],
    field: "cta",
    nextStep: "additionalInfo",
  },
  additionalInfo: {
    message:
      'Tem alguma informação adicional? (preço, desconto, prazo, bônus...) Se não, digite "não".',
    field: "additionalInfo",
    nextStep: "styles",
  },
  styles: {
    message:
      "Agora escolha os estilos visuais que deseja gerar. Selecione um ou mais!",
    options: [
      "Cinematic",
      "Infoproduto",
      "Ultra Realista",
      "Minimalista",
      "Neon Futurista",
      "Editorial / Magazine",
      "Gradiente Bold",
      "Retrô / Vintage",
    ],
    field: "styles",
    multiSelect: true,
    nextStep: "formats",
  },
  formats: {
    message: "Em quais formatos você quer os criativos?",
    options: [
      "Feed Instagram (1080×1080)",
      "Story/Reels (1080×1920)",
      "Banner Facebook (1200×628)",
      "Banner YouTube (1280×720)",
    ],
    field: "formats",
    multiSelect: true,
    nextStep: "confirm",
  },
  confirm: {
    message:
      "Perfeito! Aqui está o resumo do briefing. Posso gerar os criativos com IA?",
    options: ["Gerar Criativos!", "Quero alterar algo"],
    nextStep: "generating",
  },
  generating: {
    message: "Gerando seus criativos com IA... Isso pode levar alguns segundos por imagem.",
    nextStep: "done",
  },
  done: {
    message:
      "Seus criativos foram gerados com sucesso! Clique no botão abaixo para visualizá-los.",
    nextStep: "done",
  },
};

const styleIdMap: Record<string, string> = {
  Cinematic: "cinematic",
  Infoproduto: "infoproduto",
  "Ultra Realista": "ultra-realista",
  Minimalista: "minimalista",
  "Neon Futurista": "neon-futurista",
  "Editorial / Magazine": "editorial",
  "Gradiente Bold": "gradiente-bold",
  "Retrô / Vintage": "retro-vintage",
};

const formatIdMap: Record<string, string> = {
  "Feed Instagram (1080×1080)": "feed",
  "Story/Reels (1080×1920)": "story",
  "Banner Facebook (1200×628)": "banner",
  "Banner YouTube (1280×720)": "wide",
};

export function mapStyleLabelsToIds(labels: string[]): string[] {
  return labels.map((l) => styleIdMap[l] || l.toLowerCase());
}

export function mapFormatLabelsToIds(labels: string[]): string[] {
  return labels.map((l) => formatIdMap[l] || l.toLowerCase());
}

export function formatBriefingSummary(data: Record<string, string | string[]>): string {
  const labels: Record<string, string> = {
    productName: "Produto",
    productType: "Tipo",
    targetAudience: "Público-Alvo",
    mainBenefit: "Benefício Principal",
    tone: "Tom de Comunicação",
    colors: "Cores",
    cta: "CTA",
    additionalInfo: "Info Adicional",
    styles: "Estilos Visuais",
    formats: "Formatos",
  };

  return Object.entries(data)
    .filter(([, value]) => value && value.length > 0)
    .map(([key, value]) => {
      const label = labels[key] || key;
      const val = Array.isArray(value) ? value.join(", ") : value;
      return `• **${label}:** ${val}`;
    })
    .join("\n");
}
