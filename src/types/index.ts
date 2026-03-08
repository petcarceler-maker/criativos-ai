export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: string[];
  images?: GeneratedImage[];
}

export interface BriefingData {
  productName: string;
  productType: string;
  targetAudience: string;
  mainBenefit: string;
  tone: string;
  colors: string[];
  cta: string;
  additionalInfo: string;
  styles: string[];
  formats: string[];
}

export interface GeneratedImage {
  id: string;
  styleId: string;
  styleLabel: string;
  format: string;
  image: string; // base64 data URL
  prompt: string;
}

export interface Creative {
  id: string;
  type: "feed" | "story" | "banner" | "wide";
  label: string;
  width: number;
  height: number;
  variant: number;
  briefing: BriefingData;
  imageUrl?: string; // base64 ou URL da imagem gerada
}

export type ChatStep =
  | "welcome"
  | "productName"
  | "productType"
  | "targetAudience"
  | "mainBenefit"
  | "tone"
  | "colors"
  | "cta"
  | "additionalInfo"
  | "styles"
  | "formats"
  | "confirm"
  | "generating"
  | "done";
