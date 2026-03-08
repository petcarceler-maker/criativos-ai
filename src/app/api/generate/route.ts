import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getStyleById, buildPrompt } from "@/lib/prompt-styles";

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
  };
  format: "feed" | "story" | "banner" | "wide";
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { styleId, briefing, format } = body;

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

    if (!response.candidates || response.candidates.length === 0) {
      console.error("Resposta Gemini sem candidates:", JSON.stringify(response).slice(0, 500));
      return NextResponse.json({ error: "A API não retornou nenhum resultado. Verifique se o modelo suporta geração de imagens." }, { status: 500 });
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

function getAspectRatio(format: string): "1:1" | "9:16" | "16:9" | "3:4" | "4:3" {
  switch (format) {
    case "feed": return "1:1";
    case "story": return "9:16";
    case "banner": return "16:9";
    case "wide": return "16:9";
    default: return "1:1";
  }
}
