import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getStyleById, buildPrompt } from "@/lib/prompt-styles";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface BatchRequest {
  styleIds: string[];
  formats: ("feed" | "story" | "banner" | "wide")[];
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
  };
}

interface GeneratedCreative {
  id: string;
  styleId: string;
  styleLabel: string;
  format: string;
  image: string;
  prompt: string;
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

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();
    const { styleIds, formats, briefing } = body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "sua_chave_aqui") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada." },
        { status: 500 }
      );
    }

    const results: GeneratedCreative[] = [];
    const errors: string[] = [];

    for (const styleId of styleIds) {
      const style = getStyleById(styleId);
      if (!style) {
        errors.push(`Estilo "${styleId}" não encontrado`);
        continue;
      }

      for (const format of formats) {
        try {
          const prompt = buildPrompt(style, { ...briefing, format });

          const aspectRatio = getAspectRatio(format);
          const imagePrompt = `${prompt}\n\nIMPORTANT: Generate an image with aspect ratio ${aspectRatio}. Output ONLY the image, no text.`;

          const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash-exp-image-generation",
            contents: imagePrompt,
            config: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          });

          const parts = response.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find((p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data);
          if (imagePart?.inlineData) {
            const base64 = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType || "image/png";

            results.push({
              id: `gen-${Date.now()}-${styleId}-${format}`,
              styleId,
              styleLabel: style.label,
              format,
              image: `data:${mimeType};base64,${base64}`,
              prompt,
            });
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Erro";
          errors.push(`${style.label} (${format}): ${msg}`);
        }
      }
    }

    return NextResponse.json({
      creatives: results,
      total: results.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
