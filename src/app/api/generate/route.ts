import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Part } from "@google/genai";
import { getStyleById, buildPrompt } from "@/lib/prompt-styles";
import { getReferencesForProductType, buildReferencePromptSection } from "@/lib/reference-bank";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface GenerateRequest {
  styleId: string;
  briefing: {
    productName: string;
    productType: string;
    targetAudience: string;
    headline: string;
    subheadline: string;
    tone: string;
    colors: string[];
    cta: string;
    textPosition: "top" | "bottom";
    additionalInfo: string;
    customPrompt?: string;
  };
  format: "feed" | "story" | "banner" | "wide";
  referenceImages?: string[]; // base64 data URLs
  productPhotos?: string[]; // base64 data URLs
  useReferenceBank?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { styleId, briefing, format, referenceImages, productPhotos, useReferenceBank } = body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "sua_chave_aqui") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada." },
        { status: 500 }
      );
    }

    const style = getStyleById(styleId);
    if (!style) {
      return NextResponse.json({ error: "Estilo não encontrado" }, { status: 400 });
    }

    // Build the base prompt
    let prompt = buildPrompt(style, { ...briefing, format });

    // Add reference bank descriptions if requested
    if (useReferenceBank) {
      const refs = getReferencesForProductType(briefing.productType);
      prompt += buildReferencePromptSection(refs);
    }

    // Add custom prompt if provided
    if (briefing.customPrompt && briefing.customPrompt.toLowerCase() !== "pular") {
      prompt += `\n\nAdditional creative direction from user: ${briefing.customPrompt}`;
    }

    const aspectRatio = getAspectRatio(format);

    // Build content parts array for multimodal request
    const contentParts: Part[] = [];

    // Add product photos with instructions to preserve identity
    const hasProductPhotos = productPhotos && productPhotos.length > 0;
    if (hasProductPhotos) {
      contentParts.push({
        text: "PRODUCT/PERSON PHOTOS - You MUST use these photos in the creative. Maintain exact facial features, skin tone, hair, and physical appearance. Do NOT change the person's face or identity. Preserve the product exactly as shown:",
      });
      for (const photo of productPhotos) {
        const { base64, mimeType } = extractBase64(photo);
        contentParts.push({
          inlineData: { data: base64, mimeType },
        });
      }
    }

    // Add reference images with instructions
    const hasReferenceImages = referenceImages && referenceImages.length > 0;
    if (hasReferenceImages) {
      contentParts.push({
        text: "REFERENCE IMAGES - Use these as style/composition inspiration. Match the visual quality, lighting, and mood but create an original image:",
      });
      for (const ref of referenceImages) {
        const { base64, mimeType } = extractBase64(ref);
        contentParts.push({
          inlineData: { data: base64, mimeType },
        });
      }
    }

    // Build the main text prompt
    let mainPrompt = `${prompt}\n\nIMPORTANT: Generate an image with aspect ratio ${aspectRatio}.

CRITICAL RULE — ABSOLUTELY NO TEXT IN THE IMAGE:
- Do NOT render any text, words, letters, numbers, typography, logos, watermarks, captions, headlines, or written content of any kind inside the image.
- The image must be PURELY VISUAL — no readable characters whatsoever.
- Text/copy will be added as an overlay AFTER generation, so the image must be completely text-free.
- If the scene would naturally contain signage or labels, make them blurred, illegible, or replaced with abstract shapes.

The image should visually represent this concept through IMAGERY ONLY (no text):
- Product: "${briefing.productName}" (${briefing.productType})
- Target audience: "${briefing.targetAudience}"
- Mood/message: "${briefing.headline}" — convey this feeling through colors, composition, and visual elements, NOT through written words.
The visual elements, mood, colors, and composition should reinforce the marketing message without any text.`;

    if (hasProductPhotos) {
      mainPrompt += `\n\nCRITICAL: Incorporate the person/product from the provided photos into this creative. The person's face and features must be IDENTICAL to the photos provided. Do not alter their appearance.`;
    }

    contentParts.push({ text: mainPrompt });

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contentParts,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      console.error("Resposta Gemini sem candidates:", JSON.stringify(response).slice(0, 500));
      return NextResponse.json({ error: "A API não retornou nenhum resultado." }, { status: 500 });
    }

    const parts = response.candidates[0]?.content?.parts || [];
    const imagePart = parts.find((p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data);
    if (!imagePart || !imagePart.inlineData) {
      const textParts = parts.filter((p: { text?: string }) => p.text).map((p: { text?: string }) => p.text).join(" ");
      console.error("Nenhuma imagem nos parts. Texto retornado:", textParts);
      return NextResponse.json({ error: `Nenhuma imagem gerada. Resposta da API: ${textParts || "vazia"}` }, { status: 500 });
    }

    const base64Image = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";

    return NextResponse.json({
      image: `data:${mimeType};base64,${base64Image}`,
      prompt,
      style: style.label,
      format,
    });
  } catch (error: unknown) {
    console.error("Erro na geração:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractBase64(dataUrl: string): { base64: string; mimeType: string } {
  if (dataUrl.startsWith("data:")) {
    const mimeType = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const base64 = dataUrl.split(",")[1];
    return { base64, mimeType };
  }
  return { base64: dataUrl, mimeType: "image/jpeg" };
}

function getAspectRatio(format: string): "1:1" | "9:16" | "16:9" | "3:4" | "4:3" {
  switch (format) {
    case "feed": return "1:1";
    case "story": return "9:16";
    case "banner": return "16:9";
    case "wide": return "16:9";
    default: return "1:1";
  }
}
