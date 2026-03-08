export interface CreativeStyle {
  id: string;
  label: string;
  description: string;
  promptTemplate: string;
  negativePrompt: string;
}

export const creativeStyles: CreativeStyle[] = [
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Visual cinematográfico com iluminação dramática e profundidade",
    promptTemplate: `Award-winning commercial advertisement, cinematic color grade, teal-orange LUT, volumetric god rays, anamorphic lens flare, 50mm f/1.4 shallow depth of field, Alexa 65 cinema camera, film grain 800 ISO, sharp subject perfectly blurred background, professional color correction, {scene}, {productName} advertising campaign, large safe zone for text placement at {textPosition}, composed for {format}.`,
    negativePrompt:
      "amateur, snapshot, phone camera, flat lighting, overexposed, underexposed, cartoon, illustration, watermark, text, distorted faces, extra limbs, blurry, low resolution",
  },
  {
    id: "infoproduto",
    label: "Infoproduto",
    description: "Estilo clássico de lançamento digital brasileiro",
    promptTemplate: `Premium digital product launch advertising visual, vibrant gradient background {color1} to {color2}, modern geometric shapes, floating abstract light particles, confident person or product hero shot, professional studio lighting, clean commercial design, Brazilian digital marketing aesthetic, bold impactful composition, large headline area at {textPosition}, {scene}, promoting {productName} for {audience}, {format} advertising format, professional retouching.`,
    negativePrompt:
      "dark, moody, cluttered, messy, amateur design, old-fashioned, dull colors, low energy, watermark, text artifacts",
  },
  {
    id: "ultra-realista",
    label: "Ultra Realista",
    description: "Fotografia hiper-realista de alta qualidade",
    promptTemplate: `Hyper-realistic advertising photography, Phase One IQ4 150MP medium format, Profoto B10 octabox key light, Profoto strip-box rim light, fill card, perfect natural retouching, crisp commercial detail, skin texture visible, luxury brand campaign quality, Hasselblad color science, clean studio or lifestyle background, {scene}, {productName} advertisement, safe composition at {textPosition} for text overlay, {format} format.`,
    negativePrompt:
      "CGI look, plastic skin, over-smoothed, HDR artifacts, painting, illustration, cartoon, overprocessed, fake, wax figure, uncanny valley",
  },
  {
    id: "minimalista",
    label: "Minimalista",
    description: "Design limpo com muito espaço em branco e tipografia forte",
    promptTemplate: `Minimalist luxury brand advertising, pure white or off-white background, single focal element, ample negative space, Swiss grid design principles, natural diffused window light, one {color1} accent, Apple Mac Studio shoot quality, Leica M11 editorial photography, premium simplicity, confident composition, large clean text area at {textPosition}, {scene}, {productName} luxury advertisement, {format} format.`,
    negativePrompt:
      "busy, cluttered, colorful gradients, neon, grungy, many elements, complex backgrounds, dark, dramatic, vintage",
  },
  {
    id: "neon-futurista",
    label: "Neon Futurista",
    description: "Visual cyberpunk com neons vibrantes e estética futurista",
    promptTemplate: `Cyberpunk futuristic advertising visual, deep black background, vivid neon lights {color1} and {color2}, wet reflective surfaces, holographic prismatic effects, light bleeding neon glow, sci-fi atmosphere, Blade Runner 2049 cinematography quality, volumetric fog, Futuristic product placement, sharp neon edges, dramatic contrast, text safe area at {textPosition}, {scene}, {productName} campaign, {format} format.`,
    negativePrompt:
      "daylight, bright white background, natural, organic, vintage, pastel, soft lighting, sunshine, outdoors, cartoonish",
  },
  {
    id: "editorial",
    label: "Editorial / Magazine",
    description: "Estilo revista de moda/lifestyle premium",
    promptTemplate: `High-end editorial fashion magazine advertising spread, Vogue Brasil quality photography, dramatic Rembrandt lighting with strong shadows, high contrast black and white or desaturated palette with {color1} accent, fashion-forward composition, Helmut Newton or Annie Leibovitz style, luxurious textures and materials, editorial crop, medium format film look, aspirational lifestyle, text block area at {textPosition}, {scene}, {productName} editorial, {format} format.`,
    negativePrompt:
      "amateur, casual snapshot, stock photo feel, clipart, cartoonish, low budget, commercial kitsch, flat even lighting",
  },
  {
    id: "gradiente-bold",
    label: "Gradiente Bold",
    description: "Gradientes vibrantes com formas geométricas ousadas",
    promptTemplate: `Bold modern graphic design masterpiece, vivid gradient {color1} through {color2} to {color3}, abstract 3D geometric spheres and floating shapes, glass morphism translucent layers, specular highlights, modern SaaS product visual, Dribbble shot of the year quality, depth and parallax layers, vibrant brand identity, dynamic diagonal composition, Apple WWDC slide quality, headline area at {textPosition}, {scene}, {productName} visual, {format} format.`,
    negativePrompt:
      "photography, realistic persons, vintage, muted, flat, boring, simple background, corporate generic, stock photo",
  },
  {
    id: "retro-vintage",
    label: "Retrô / Vintage",
    description: "Estética nostálgica com texturas envelhecidas",
    promptTemplate: `Vintage 1970s advertising poster, warm Kodachrome color palette, amber and cream tones with {color1} accent, halftone dot screen printing texture, aged yellowed paper grain, analog film photography look, retro nostalgia, hand-crafted feel, sunburst background element, retro product shot, Wes Anderson color palette, worn texture overlay, text area at {textPosition}, {scene}, {productName} vintage advertisement, {format} format.`,
    negativePrompt:
      "modern, clean, digital looking, neon, futuristic, sharp HD, clinical, cold colors, minimalist, tech",
  },
];

export function getStyleById(id: string): CreativeStyle | undefined {
  return creativeStyles.find((s) => s.id === id);
}

interface PromptContext {
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
  format: "feed" | "story" | "banner" | "wide";
}

const colorMap: Record<string, { color1: string; color2: string; color3: string }> = {
  "Azul e Branco": { color1: "electric blue", color2: "pure white", color3: "sky blue" },
  "Preto e Dourado": { color1: "deep black", color2: "gold", color3: "dark champagne" },
  "Vermelho e Preto": { color1: "crimson red", color2: "deep black", color3: "blood red" },
  "Verde e Branco": { color1: "emerald green", color2: "pure white", color3: "mint" },
  "Roxo e Rosa": { color1: "deep violet", color2: "hot pink", color3: "neon magenta" },
  "Laranja e Amarelo": { color1: "vibrant orange", color2: "golden yellow", color3: "amber" },
};

const toneToScene: Record<string, string> = {
  "Profissional e Sério":
    "corporate executive atmosphere, authority and trust, business environment, confident professional",
  "Descontraído e Jovem":
    "youthful dynamic energy, casual lifestyle, bright fresh atmosphere, relatable and fun",
  "Urgente e Persuasivo":
    "bold high-energy urgency, dramatic tension, action-oriented, compelling call to action",
  "Luxuoso e Premium":
    "ultra-luxury exclusive atmosphere, gold accents, VIP premium lifestyle, aspirational wealth",
  "Motivacional e Inspirador":
    "inspiring sunrise breakthrough moment, achievement energy, transformation, success and growth",
};

const formatToTextPosition: Record<string, string> = {
  feed: "lower third of the square composition",
  story: "upper 30% of the vertical composition",
  banner: "left 40% of the horizontal composition",
  wide: "left third of the widescreen composition",
};

const formatToAspect: Record<string, string> = {
  feed: "square 1:1",
  story: "vertical 9:16 portrait",
  banner: "horizontal 1.91:1 wide",
  wide: "widescreen 16:9",
};

export function buildPrompt(style: CreativeStyle, context: PromptContext): string {
  const colors = colorMap[context.colors[0]] || colorMap["Azul e Branco"];
  const scene = toneToScene[context.tone] || toneToScene["Profissional e Sério"];
  const textPos = context.textPosition === "top" ? "top" : "bottom";
  const textPosition = `${textPos} — leave this zone very clean with high contrast dark/light area for legible text`;
  const format = formatToAspect[context.format] || "square";
  const audience = context.targetAudience;

  let prompt = style.promptTemplate
    .replace("{scene}", `${scene}`)
    .replace("{format}", format)
    .replace("{textPosition}", textPosition)
    .replace("{productName}", context.productName)
    .replace("{audience}", audience)
    .replace(/\{color1\}/g, colors.color1)
    .replace(/\{color2\}/g, colors.color2)
    .replace(/\{color3\}/g, colors.color3);

  // Add product type and additional context
  prompt += ` Product: ${context.productType}.`;

  if (context.additionalInfo && context.additionalInfo.toLowerCase() !== "não") {
    prompt += ` Campaign detail: ${context.additionalInfo}.`;
  }

  // Marketing copy alignment — image must match the message
  prompt += `\n\nThe visual MUST convey: "${context.headline}" — ${context.subheadline}. The composition, mood, subject, and color should reinforce this exact message for the target audience: ${context.targetAudience}.`;

  // Quality boost
  prompt += `\n\nQuality: ultra-detailed, 8k resolution, professional color grading, award-winning commercial photography, perfectly composed, no distortion, photorealistic quality, publishable advertising visual.`;

  // No text in image — overlaid separately
  prompt += `\n\nCRITICAL: Do NOT include any text, words, letters, numbers, or typography anywhere in the image. Leave the ${textPos} zone clean with high contrast for text overlay.`;

  return prompt;
}

export function buildNegativePrompt(style: CreativeStyle): string {
  return style.negativePrompt + ", text, letters, words, numbers, typography, watermark, signature, logo, UI elements";
}
