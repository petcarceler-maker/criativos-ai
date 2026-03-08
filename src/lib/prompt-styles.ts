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
    promptTemplate: `Cinematic movie poster style digital advertisement. {scene}.
Dramatic volumetric lighting, shallow depth of field, anamorphic lens flare,
film grain texture, moody atmosphere, professional color grading with teal and orange tones.
High-end commercial photography feel.
Text overlay area preserved at {textPosition}.
Product: "{productName}". Headline: "{headline}".
Ultra high quality, 8k resolution, photorealistic.`,
    negativePrompt:
      "low quality, blurry, amateur, cartoon, anime, illustration, watermark, text artifacts, distorted faces",
  },
  {
    id: "infoproduto",
    label: "Infoproduto",
    description: "Estilo clássico de lançamento digital brasileiro",
    promptTemplate: `Professional digital marketing banner for online course/info product launch.
{scene}. Clean modern design with bold typography space.
Gradient background transitioning from {color1} to {color2}.
Geometric abstract shapes and subtle light effects.
Professional person silhouette or abstract success imagery.
Space for large headline text at {textPosition}.
Product: "{productName}". Target: "{audience}".
Corporate modern style, clean, premium, digital marketing aesthetic.`,
    negativePrompt:
      "low quality, cluttered, messy, childish, unprofessional, too many elements, watermark",
  },
  {
    id: "ultra-realista",
    label: "Ultra Realista",
    description: "Fotografia hiper-realista de alta qualidade",
    promptTemplate: `Hyper-realistic professional product photography advertisement. {scene}.
Shot on Hasselblad H6D-400c, 80mm lens, f/2.8.
Perfect studio lighting setup with key light, fill light, and rim light.
Crisp details, natural skin tones, professional retouching.
Clean background with subtle gradient. Space for text at {textPosition}.
Product: "{productName}".
Award-winning commercial photography, ultra detailed, photorealistic, 8k.`,
    negativePrompt:
      "illustration, painting, cartoon, cgi look, fake, plastic skin, overprocessed, HDR artifacts",
  },
  {
    id: "minimalista",
    label: "Minimalista",
    description: "Design limpo com muito espaço em branco e tipografia forte",
    promptTemplate: `Minimalist luxury brand advertisement design. {scene}.
Clean white or dark background with ample negative space.
Single focal point with elegant composition.
Soft natural lighting, muted color palette with one accent color ({color1}).
Premium feel, Apple-style aesthetics. Large text area at {textPosition}.
Product: "{productName}".
Swiss design principles, clean lines, sophisticated, editorial quality.`,
    negativePrompt:
      "cluttered, busy, colorful, loud, cheap looking, many elements, gradients, effects",
  },
  {
    id: "neon-futurista",
    label: "Neon Futurista",
    description: "Visual cyberpunk com neons vibrantes e estética futurista",
    promptTemplate: `Futuristic cyberpunk neon advertisement design. {scene}.
Dark background with vibrant neon lights in {color1} and {color2}.
Glowing edges, holographic effects, reflective wet surfaces.
Sci-fi atmosphere, futuristic city elements.
Neon sign aesthetic with light bleeding effects. Text area at {textPosition}.
Product: "{productName}".
Cyberpunk 2077 style, Blade Runner atmosphere, high contrast, vivid neon colors.`,
    negativePrompt:
      "daylight, bright, natural, organic, vintage, retro, pastel colors, soft lighting",
  },
  {
    id: "editorial",
    label: "Editorial / Magazine",
    description: "Estilo revista de moda/lifestyle premium",
    promptTemplate: `High-end editorial magazine advertisement. {scene}.
Vogue/GQ style photography with fashion-forward composition.
Dramatic lighting with strong shadows, high contrast.
Sophisticated color palette, editorial cropping.
Luxurious textures and materials visible. Text area at {textPosition}.
Product: "{productName}".
Harper's Bazaar aesthetic, fashion photography, editorial layout, premium quality.`,
    negativePrompt:
      "amateur, snapshot, casual, low budget, stock photo feel, clipart, cartoon",
  },
  {
    id: "gradiente-bold",
    label: "Gradiente Bold",
    description: "Gradientes vibrantes com formas geométricas ousadas",
    promptTemplate: `Bold modern graphic design advertisement with vibrant gradients. {scene}.
Abstract geometric shapes, circles, and flowing forms.
Rich gradient from {color1} through {color2} to {color3}.
3D floating elements, glass morphism effects, depth layers.
Modern tech startup aesthetic. Large headline space at {textPosition}.
Product: "{productName}".
Dribbble trending style, bold typography areas, modern UI aesthetic, vibrant.`,
    negativePrompt:
      "photography, realistic, vintage, muted colors, flat design, boring, simple",
  },
  {
    id: "retro-vintage",
    label: "Retrô / Vintage",
    description: "Estética nostálgica com texturas envelhecidas",
    promptTemplate: `Vintage retro style advertisement poster. {scene}.
1970s-80s color palette with warm tones, orange, brown, cream.
Film grain texture, faded colors, retro typography space.
Halftone dot pattern overlay, aged paper texture.
Nostalgic atmosphere. Text area at {textPosition}.
Product: "{productName}".
Retro poster design, vintage advertising aesthetic, analog photography feel.`,
    negativePrompt:
      "modern, clean, minimalist, digital looking, neon, futuristic, sharp, clinical",
  },
];

export function getStyleById(id: string): CreativeStyle | undefined {
  return creativeStyles.find((s) => s.id === id);
}

interface PromptContext {
  productName: string;
  productType: string;
  targetAudience: string;
  mainBenefit: string;
  tone: string;
  colors: string[];
  cta: string;
  additionalInfo: string;
  format: "feed" | "story" | "banner" | "wide";
}

const colorMap: Record<string, { color1: string; color2: string; color3: string }> = {
  "Azul e Branco": { color1: "deep blue", color2: "white", color3: "sky blue" },
  "Preto e Dourado": { color1: "black", color2: "gold", color3: "dark bronze" },
  "Vermelho e Preto": { color1: "crimson red", color2: "black", color3: "dark red" },
  "Verde e Branco": { color1: "emerald green", color2: "white", color3: "mint" },
  "Roxo e Rosa": { color1: "deep purple", color2: "hot pink", color3: "magenta" },
  "Laranja e Amarelo": { color1: "vibrant orange", color2: "golden yellow", color3: "amber" },
};

const toneToScene: Record<string, string> = {
  "Profissional e Sério":
    "Professional corporate atmosphere, executive environment, trust and authority",
  "Descontraído e Jovem":
    "Casual youthful vibe, dynamic energy, bright and fresh atmosphere",
  "Urgente e Persuasivo":
    "High-energy urgent feeling, bold and impactful, action-oriented atmosphere",
  "Luxuoso e Premium":
    "Luxury premium atmosphere, exclusive VIP feeling, gold accents and rich textures",
  "Motivacional e Inspirador":
    "Inspirational sunrise/mountain top atmosphere, achievement and success feeling",
};

const formatToTextPosition: Record<string, string> = {
  feed: "center of the square composition",
  story: "upper third of the vertical composition",
  banner: "left side of the horizontal composition",
  wide: "center-left of the widescreen composition",
};

const formatToAspect: Record<string, string> = {
  feed: "square 1:1 format",
  story: "vertical 9:16 format, tall portrait",
  banner: "horizontal 1.91:1 format, wide landscape",
  wide: "widescreen 16:9 format",
};

export function buildPrompt(style: CreativeStyle, context: PromptContext): string {
  const colors = colorMap[context.colors[0]] || colorMap["Azul e Branco"];
  const scene = toneToScene[context.tone] || toneToScene["Profissional e Sério"];
  const textPosition = formatToTextPosition[context.format] || "center";
  const aspect = formatToAspect[context.format] || "square";

  const headline = context.mainBenefit;
  const audience = context.targetAudience;

  let prompt = style.promptTemplate
    .replace("{scene}", `${scene}. ${aspect}`)
    .replace("{textPosition}", textPosition)
    .replace("{productName}", context.productName)
    .replace("{headline}", headline)
    .replace("{audience}", audience)
    .replace(/\{color1\}/g, colors.color1)
    .replace(/\{color2\}/g, colors.color2)
    .replace(/\{color3\}/g, colors.color3);

  // Adicionar contexto extra
  prompt += `\nProduct type: ${context.productType}. Main benefit: "${context.mainBenefit}".`;

  if (context.additionalInfo && context.additionalInfo.toLowerCase() !== "não") {
    prompt += ` Additional context: ${context.additionalInfo}.`;
  }

  // IMPORTANTE: Instruir para NÃO gerar texto na imagem
  prompt += `\n\nIMPORTANT: Do NOT include any text, letters, words, numbers, or typography in the image. The image should be purely visual with space reserved for text overlay to be added later in post-production.`;

  return prompt;
}

export function buildNegativePrompt(style: CreativeStyle): string {
  return style.negativePrompt + ", text, letters, words, numbers, typography, watermark, signature";
}
