export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  options?: string[];
  images?: GeneratedImage[];
  uploadedImages?: string[]; // base64 previews of uploaded images
}

export interface BriefingData {
  productName: string;
  productType: string;
  targetAudience: string;
  headline: string;
  subheadline: string;
  tone: string;
  colors: string[];
  cta: string;
  textPosition: "top" | "bottom";
  quantity: number;
  additionalInfo: string;
  styles: string[];
  formats: string[];
  customPrompt: string;
  referenceImages: string[]; // base64 data URLs
  productPhotos: string[]; // base64 data URLs for photos to use in the creative
}

export interface TextOverlay {
  headline: string;
  subheadline: string;
  cta: string;
  textPosition: "top" | "bottom";
}

export interface GeneratedImage {
  id: string;
  styleId: string;
  styleLabel: string;
  format: string;
  image: string; // base64 data URL (with text overlay)
  baseImage: string; // base64 data URL (clean, without text)
  prompt: string;
  textOverlay: TextOverlay;
}

export interface Creative {
  id: string;
  type: "feed" | "story" | "banner" | "wide";
  label: string;
  width: number;
  height: number;
  variant: number;
  briefing: BriefingData;
  imageUrl?: string;
}

export type ChatStep =
  | "welcome"
  | "productName"
  | "productType"
  | "targetAudience"
  | "headline"
  | "subheadline"
  | "tone"
  | "colors"
  | "cta"
  | "textPosition"
  | "additionalInfo"
  | "referenceImages"
  | "productPhotos"
  | "customPrompt"
  | "styles"
  | "formats"
  | "quantity"
  | "confirm"
  | "generating"
  | "done";
