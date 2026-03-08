import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
    }

    const body = await request.json();
    const { image } = body as { image: string };

    if (!image) {
      return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
    }

    // Extract base64 and mimeType from data URL
    let base64: string;
    let mimeType: string;
    if (image.startsWith("data:")) {
      mimeType = image.split(",")[0].split(":")[1].split(";")[0];
      base64 = image.split(",")[1];
    } else {
      base64 = image;
      mimeType = "image/jpeg";
    }

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: { data: base64, mimeType },
            },
            {
              text: `You are an expert prompt engineer for AI image generation (Midjourney, DALL-E, Gemini, Stable Diffusion).

Analyze this advertising creative / marketing image in extreme detail and reverse-engineer a complete image generation prompt that would recreate it.

Your prompt MUST include:
1. **Photography/camera style** — camera model, lens, aperture, lighting setup (e.g. "Phase One IQ4, 85mm f/1.8, Profoto octabox key light")
2. **Composition** — framing, angle, subject placement, negative space, rule of thirds
3. **Color palette** — exact color descriptions, color grading, LUT style
4. **Lighting** — type, direction, quality, shadows, highlights, volumetric effects
5. **Mood/atmosphere** — emotional tone, energy level
6. **Subject description** — what's in the image, poses, expressions, objects, environment
7. **Texture/quality** — grain, sharpness, post-processing style, resolution
8. **Format** — aspect ratio, composition orientation
9. **Style references** — photographers, brands, campaigns, magazines this reminds you of

Output ONLY the prompt in English. No explanations, no headers, no markdown.
The prompt should be a single paragraph of comma-separated descriptive phrases, optimized for AI image generation.
Do NOT include any text/typography that appears in the image — the prompt should describe the VISUAL only.
End the prompt with: "ultra-detailed, 8k resolution, professional advertising photography, publishable quality"`,
            },
          ],
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts
      ?.filter((p: { text?: string }) => p.text)
      .map((p: { text?: string }) => p.text)
      .join("") || "";

    if (!text) {
      return NextResponse.json({ error: "Não foi possível extrair o prompt." }, { status: 500 });
    }

    return NextResponse.json({ prompt: text.trim() });
  } catch (error: unknown) {
    console.error("Erro na extração de prompt:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
