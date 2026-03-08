import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Part } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface VisualGenerateRequest {
  subjectPhotos: string[];
  quantity: number;
  gender: "masculino" | "feminino";
  poseDescription: string;
  subjectPosition: "esquerda" | "centro" | "direita";
  dimension: "story" | "horizontal" | "feed" | "retrato";
  textEnabled: boolean;
  textOverlay?: {
    headline: string;
    subheadline: string;
    cta: string;
    position: "top" | "bottom";
  };
  niche: string;
  environment: string;
  scenePhotos: string[];
  ambientColor: string;
  rimLightColor: string;
  fillLightColor: string;
  composition: "closeup" | "medium" | "american" | "full";
  referenceImages: string[];
  sobriety: number;
  styleTag: string;
  useBlur: boolean;
  useGradient: boolean;
  floatingElements: boolean;
  additionalPrompt: string;
}

const dimensionMap: Record<string, { ratio: string; label: string }> = {
  story: { ratio: "9:16", label: "vertical portrait 9:16" },
  horizontal: { ratio: "16:9", label: "horizontal landscape 16:9" },
  feed: { ratio: "1:1", label: "square 1:1" },
  retrato: { ratio: "4:5", label: "portrait 4:5" },
};

const compositionMap: Record<string, string> = {
  closeup: "extreme close-up shot framing the face, head and shoulders only, cinematic portrait crop",
  medium: "medium shot from the waist up, bust framing, classic portrait composition",
  american: "American shot / cowboy shot, framed from mid-thigh up, dynamic three-quarter body",
  full: "full body shot, complete figure visible, environmental portrait",
};

const positionMap: Record<string, string> = {
  esquerda: "subject positioned on the left third of the frame (rule of thirds left)",
  centro: "subject centered in the frame, symmetrical composition",
  direita: "subject positioned on the right third of the frame (rule of thirds right)",
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
    }

    const body: VisualGenerateRequest = await request.json();

    const dim = dimensionMap[body.dimension] || dimensionMap.feed;
    const comp = compositionMap[body.composition] || compositionMap.medium;
    const pos = positionMap[body.subjectPosition] || positionMap.centro;

    // Build sobriety description
    const sobrietyLevel = body.sobriety;
    const sobrietyDesc =
      sobrietyLevel <= 25
        ? "highly creative, experimental, vibrant, bold artistic choices, saturated colors, dramatic effects"
        : sobrietyLevel <= 50
        ? "balanced creative-professional, moderately vibrant, tasteful artistic flair"
        : sobrietyLevel <= 75
        ? "professional and polished, clean corporate aesthetic, subtle elegance"
        : "extremely sober, minimal, corporate, muted tones, understated, conservative";

    // Build style description
    const styleDesc = body.styleTag ? `Visual style: ${body.styleTag} aesthetic.` : "";

    // Build lighting
    const lightingDesc = `Three-point lighting setup: ambient/key light with ${body.ambientColor || "neutral"} tone, rim/edge light with ${body.rimLightColor || "warm white"} tone for separation, fill/complementary light with ${body.fillLightColor || "cool"} tone for shadow detail.`;

    // Subject gender
    const genderDesc = body.gender === "masculino" ? "male" : "female";

    // Environment
    const envDesc = body.environment ? `Environment/setting: ${body.environment}.` : "";

    // Pose
    const poseDesc = body.poseDescription ? `Pose and clothing: ${body.poseDescription}.` : "";

    // Effects
    const effects: string[] = [];
    if (body.useBlur) effects.push("shallow depth of field with creamy bokeh background blur");
    if (body.useGradient) effects.push("subtle lateral gradient overlay for depth");
    if (body.floatingElements) effects.push("floating decorative elements, particles, or geometric shapes around the subject");

    // Build main prompt
    let prompt = `Professional advertising creative for ${body.niche || "digital marketing"} niche.

${comp}, ${pos}.
Subject: ${genderDesc} person/model. ${poseDesc}
${envDesc}
${lightingDesc}
${styleDesc}
${sobrietyDesc}.
${effects.length > 0 ? `Effects: ${effects.join(", ")}.` : ""}

Aspect ratio: ${dim.label}.
Quality: ultra-detailed, 8k resolution, professional color grading, award-winning commercial photography, perfectly composed, no distortion, photorealistic quality, publishable advertising visual.

CRITICAL RULE — ABSOLUTELY NO TEXT IN THE IMAGE:
- Do NOT render any text, words, letters, numbers, typography, logos, watermarks, captions, headlines, or written content of any kind.
- The image must be PURELY VISUAL — no readable characters whatsoever.
- If the scene would naturally contain signage or labels, make them blurred or replaced with abstract shapes.`;

    if (body.textEnabled) {
      const textPos = body.textOverlay?.position === "top" ? "top" : "bottom";
      prompt += `\nLeave the ${textPos} area of the image clean with high contrast for text overlay that will be added later.`;
    }

    if (body.additionalPrompt) {
      prompt += `\n\nAdditional creative direction: ${body.additionalPrompt}`;
    }

    // Build content parts
    const contentParts: Part[] = [];

    // Subject photos
    if (body.subjectPhotos.length > 0) {
      contentParts.push({
        text: "SUBJECT PHOTOS — You MUST use these photos. Maintain EXACT facial features, skin tone, hair, and physical appearance. The person in the generated image must be IDENTICAL to these reference photos:",
      });
      for (const photo of body.subjectPhotos) {
        const { base64, mimeType } = extractBase64(photo);
        contentParts.push({ inlineData: { data: base64, mimeType } });
      }
    }

    // Scene photos
    if (body.scenePhotos.length > 0) {
      contentParts.push({
        text: "SCENE/ENVIRONMENT PHOTOS — Use these as the background/environment reference:",
      });
      for (const photo of body.scenePhotos) {
        const { base64, mimeType } = extractBase64(photo);
        contentParts.push({ inlineData: { data: base64, mimeType } });
      }
    }

    // Reference images
    if (body.referenceImages.length > 0) {
      contentParts.push({
        text: "STYLE REFERENCE IMAGES — Match the visual style, lighting, mood, and composition of these references:",
      });
      for (const ref of body.referenceImages) {
        const { base64, mimeType } = extractBase64(ref);
        contentParts.push({ inlineData: { data: base64, mimeType } });
      }
    }

    contentParts.push({ text: prompt });

    // Generate multiple images
    const results: { image: string; index: number }[] = [];

    for (let i = 0; i < body.quantity; i++) {
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: contentParts,
        config: { responseModalities: ["TEXT", "IMAGE"] },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(
        (p: { inlineData?: { data?: string; mimeType?: string } }) => p.inlineData?.data
      );

      if (imagePart?.inlineData) {
        const base64 = imagePart.inlineData.data;
        const mime = imagePart.inlineData.mimeType || "image/png";
        results.push({ image: `data:${mime};base64,${base64}`, index: i });
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "Nenhuma imagem gerada." }, { status: 500 });
    }

    return NextResponse.json({ images: results, prompt });
  } catch (error: unknown) {
    console.error("Erro na geração visual:", error);
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
