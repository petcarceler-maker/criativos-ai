// Banco de descrições de criativos validados para usar como referência no prompt.
// A IA usa essas descrições para se inspirar ao gerar criativos.

export interface ReferenceCreative {
  id: string;
  category: string;
  description: string;
  styleNotes: string;
}

export const referenceBank: ReferenceCreative[] = [
  // --- Lançamentos digitais ---
  {
    id: "ref-launch-01",
    category: "Lançamento Digital",
    description: "Criativo de lançamento com pessoa confiante de braços cruzados olhando para a câmera, fundo gradiente escuro com partículas douradas, área limpa na parte inferior para texto de conversão.",
    styleNotes: "High contrast, luxury feel, dark gradient with gold particles, confident pose, direct eye contact",
  },
  {
    id: "ref-launch-02",
    category: "Lançamento Digital",
    description: "Banner de webinar ao vivo com laptop aberto mostrando gráficos de crescimento, ambiente de home office premium, iluminação quente lateral, espaço para headline no topo.",
    styleNotes: "Warm side lighting, premium home office, growth charts on screen, aspirational lifestyle",
  },
  {
    id: "ref-launch-03",
    category: "Lançamento Digital",
    description: "Criativo de urgência com countdown timer visual, fundo vermelho e preto com efeito de luz dramática, pessoa apontando para a câmera, energia de escassez.",
    styleNotes: "Red and black palette, dramatic lighting, pointing gesture, urgency and scarcity energy",
  },

  // --- E-commerce / Produto Físico ---
  {
    id: "ref-ecom-01",
    category: "E-commerce",
    description: "Produto flutuando no centro com sombra suave, fundo gradiente limpo e moderno, raios de luz sutis, composição centralizada minimalista premium.",
    styleNotes: "Floating product, soft shadow, clean gradient background, subtle light rays, minimalist premium",
  },
  {
    id: "ref-ecom-02",
    category: "E-commerce",
    description: "Flat lay lifestyle com produto cercado de elementos decorativos relacionados, vista de cima, paleta de cores harmoniosa, estilo editorial de revista.",
    styleNotes: "Top-down flat lay, lifestyle elements, harmonious color palette, magazine editorial style",
  },

  // --- SaaS / Tech ---
  {
    id: "ref-saas-01",
    category: "SaaS / Tech",
    description: "Dashboard de software com interface moderna em tela de laptop/monitor, fundo escuro com gradiente azul e roxo, elementos flutuantes de UI, estética tech premium.",
    styleNotes: "Dark background, blue-purple gradient, floating UI elements, modern dashboard, tech premium aesthetic",
  },
  {
    id: "ref-saas-02",
    category: "SaaS / Tech",
    description: "Mockup de app mobile com tela brilhante, fundo com formas geométricas abstratas e gradientes vibrantes, efeito de profundidade 3D.",
    styleNotes: "Bright app screen, abstract geometric shapes, vibrant gradients, 3D depth effect",
  },

  // --- Mentoria / Coaching ---
  {
    id: "ref-coaching-01",
    category: "Mentoria / Coaching",
    description: "Mentor profissional em ambiente sofisticado, iluminação de estúdio com rim light, expressão confiante e acolhedora, fundo desfocado premium, espaço para depoimento.",
    styleNotes: "Studio lighting with rim light, confident welcoming expression, blurred premium background",
  },
  {
    id: "ref-coaching-02",
    category: "Mentoria / Coaching",
    description: "Before/after visual com divisão diagonal, lado esquerdo em tons frios representando o antes, lado direito em tons quentes representando transformação, energia motivacional.",
    styleNotes: "Diagonal split, cool tones vs warm tones, transformation energy, motivational",
  },

  // --- Eventos / Workshops ---
  {
    id: "ref-event-01",
    category: "Evento / Workshop",
    description: "Palco de evento com iluminação dramática, luzes de palco em azul e roxo, silhueta de plateia, atmosfera de energia e exclusividade, espaço para data e local.",
    styleNotes: "Dramatic stage lighting, blue and purple stage lights, audience silhouette, exclusive atmosphere",
  },

  // --- Fitness / Saúde ---
  {
    id: "ref-fitness-01",
    category: "Fitness / Saúde",
    description: "Pessoa em ação atlética com iluminação dramática, gotículas de suor visíveis, fundo escuro com splash de cor vibrante, energia e determinação.",
    styleNotes: "Athletic action pose, dramatic lighting, sweat droplets, dark background with vibrant color splash",
  },

  // --- Food / Gastronomia ---
  {
    id: "ref-food-01",
    category: "Food / Gastronomia",
    description: "Food photography com ingredientes frescos em composição artística, iluminação lateral quente, vapor sutil, texturas visíveis, estilo editorial gourmet.",
    styleNotes: "Warm side lighting, subtle steam, visible textures, editorial gourmet style, fresh ingredients",
  },
];

export function getReferencesForProductType(productType: string): ReferenceCreative[] {
  const typeMap: Record<string, string[]> = {
    "Curso Online": ["Lançamento Digital", "Mentoria / Coaching"],
    "Mentoria": ["Mentoria / Coaching", "Lançamento Digital"],
    "E-book": ["Lançamento Digital", "E-commerce"],
    "Software/SaaS": ["SaaS / Tech"],
    "Produto Físico": ["E-commerce", "Food / Gastronomia"],
    "Serviço": ["Mentoria / Coaching", "SaaS / Tech"],
    "Evento/Workshop": ["Evento / Workshop", "Lançamento Digital"],
  };

  const categories = typeMap[productType] || ["Lançamento Digital"];
  return referenceBank.filter((r) => categories.includes(r.category));
}

export function buildReferencePromptSection(refs: ReferenceCreative[]): string {
  if (refs.length === 0) return "";

  const descriptions = refs
    .slice(0, 3)
    .map((r, i) => `Reference ${i + 1}: ${r.description} (Style: ${r.styleNotes})`)
    .join("\n");

  return `\n\nUse these validated creative references as inspiration for composition, lighting, and overall aesthetic:\n${descriptions}\nAdapt and combine these reference styles while maintaining originality.`;
}
