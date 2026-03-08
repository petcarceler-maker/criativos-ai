import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getStyleById, buildPrompt, CreativeStyle } from "@/lib/prompt-styles";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface GenerateRequest {
  styleId: string;
  briefing: {
    productName: string;
    productType: string;
    targetAudience: string;
    mainBenefit: string;
    tone: string;
    colors: string[];
    cta: string;
    additionalInfo: string;
  };
  format: "feed" | "story" | "banner" | "wide";
}

const formatDimensions: Record<string, { width: number; height: number }> = {
  feed: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  banner: { width: 1200, height: 628 },
  wide: { width: 1280, height: 720 },
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { styleId, briefing, format } = body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "sua_chave_aqui") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada. Adicione sua chave no arquivo .env.local" },
        { status: 500 }
      );
    }

    const style = getStyleById(styleId);
    if (!style) {
      return NextResponse.json({ error: "Estilo não encontrado" }, { status: 400 });
    }

    const prompt = buildPrompt(style, { ...briefing, format });
    const dimensions = formatDimensions[format];

    // Usar Gemini com Imagen 3 para gerar a imagem
    const response = await genAI.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: getAspectRatio(format),
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      return NextResponse.json({ error: "Nenhuma imagem gerada" }, { status: 500 });
    }

    const imageBytes = response.generatedImages[0].image?.imageBytes;
    if (!imageBytes) {
      return NextResponse.json({ error: "Imagem sem dados" }, { status: 500 });
    }

    // Retornar imagem como base64
    const base64Image = typeof imageBytes === "string"
      ? imageBytes
      : Buffer.from(imageBytes).toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64Image}`,
      prompt,
      style: style.label,
      format,
      dimensions,
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
