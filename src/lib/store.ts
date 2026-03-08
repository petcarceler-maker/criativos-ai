"use client";

import { BriefingData, Creative } from "@/types";
import { generateTemplateVariants, TemplateData } from "./creative-templates";

const STORAGE_KEY = "criativos-ai-data";

interface AppData {
  briefings: BriefingData[];
  creatives: Creative[];
  templates: TemplateData[];
}

function getStoredData(): AppData {
  if (typeof window === "undefined") {
    return { briefings: [], creatives: [], templates: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { briefings: [], creatives: [], templates: [] };
  } catch {
    return { briefings: [], creatives: [], templates: [] };
  }
}

function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveBriefingAndGenerateCreatives(briefing: BriefingData): {
  creatives: Creative[];
  templates: TemplateData[];
} {
  const data = getStoredData();
  data.briefings.push(briefing);

  const templates = generateTemplateVariants(briefing);

  const formats: { type: Creative["type"]; label: string; width: number; height: number }[] = [
    { type: "feed", label: "Feed Instagram", width: 1080, height: 1080 },
    { type: "story", label: "Story/Reels", width: 1080, height: 1920 },
    { type: "banner", label: "Banner Facebook", width: 1200, height: 628 },
    { type: "wide", label: "Banner YouTube", width: 1280, height: 720 },
  ];

  const creatives: Creative[] = [];

  templates.forEach((_, templateIdx) => {
    formats.forEach((format) => {
      creatives.push({
        id: `cr-${Date.now()}-${templateIdx}-${format.type}`,
        type: format.type,
        label: `${format.label} - Variante ${templateIdx + 1}`,
        width: format.width,
        height: format.height,
        variant: templateIdx,
        briefing,
      });
    });
  });

  data.creatives = [...data.creatives, ...creatives];
  data.templates = templates;
  saveData(data);

  return { creatives, templates };
}

export function getStoredCreatives(): Creative[] {
  return getStoredData().creatives;
}

export function getStoredTemplates(): TemplateData[] {
  return getStoredData().templates;
}

export function clearAll() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
