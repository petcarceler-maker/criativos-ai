"use client";

import { useRef, useCallback } from "react";
import { Download } from "lucide-react";
import { TemplateData, renderCreativeHTML } from "@/lib/creative-templates";

interface Props {
  template: TemplateData;
  width: number;
  height: number;
  label: string;
  previewScale?: number;
}

export default function CreativePreview({
  template,
  width,
  height,
  label,
  previewScale = 0.25,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;

    try {
      const { toPng } = await import("html-to-image");
      const innerEl = el.querySelector("[data-creative]") as HTMLElement;
      if (!innerEl) return;

      const dataUrl = await toPng(innerEl, {
        width,
        height,
        pixelRatio: 1,
        style: {
          transform: "none",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = `${label.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download error:", err);
    }
  }, [width, height, label]);

  const html = renderCreativeHTML(template, width, height);
  const previewW = width * previewScale;
  const previewH = height * previewScale;

  return (
    <div className="group">
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden border border-surface-border bg-surface relative"
        style={{ width: previewW, height: previewH }}
      >
        <div
          data-creative
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
            width,
            height,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleDownload}
            className="bg-white text-black rounded-full p-2.5 hover:scale-110 transition"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-text-muted mt-2 text-center truncate max-w-full">
        {label}
      </p>
    </div>
  );
}
