import { TextOverlay } from "@/types";

const formatDimensions: Record<string, { width: number; height: number }> = {
  feed: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  banner: { width: 1200, height: 628 },
  wide: { width: 1280, height: 720 },
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function applyTextOverlay(
  baseImageDataUrl: string,
  overlay: TextOverlay,
  format: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const dims = formatDimensions[format] || { width: img.width, height: img.height };
      const canvas = document.createElement("canvas");
      canvas.width = dims.width;
      canvas.height = dims.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // --- Draw base image ---
      ctx.drawImage(img, 0, 0, dims.width, dims.height);

      const W = dims.width;
      const H = dims.height;
      const isTop = overlay.textPosition === "top";
      const pad = Math.round(W * 0.07);
      const maxTextW = W - pad * 2;

      // --- Typography scale ---
      const headlineSize = Math.round(W * 0.068);
      const subSize = Math.round(W * 0.033);
      const ctaSize = Math.round(W * 0.030);
      const lineH = 1.25;
      const gap = Math.round(W * 0.018);
      const ctaBtnPadX = Math.round(W * 0.045);
      const ctaBtnPadY = Math.round(W * 0.016);

      // --- Measure text ---
      ctx.font = `900 ${headlineSize}px "Helvetica Neue", Arial, sans-serif`;
      const headLines = wrapText(ctx, overlay.headline || "", maxTextW);

      ctx.font = `400 ${subSize}px "Helvetica Neue", Arial, sans-serif`;
      const subLines = wrapText(ctx, overlay.subheadline || "", maxTextW);

      ctx.font = `700 ${ctaSize}px "Helvetica Neue", Arial, sans-serif`;
      const ctaMetrics = ctx.measureText(overlay.cta || "");
      const ctaBtnW = ctaMetrics.width + ctaBtnPadX * 2;
      const ctaBtnH = ctaSize + ctaBtnPadY * 2;

      const blockH =
        headLines.length * headlineSize * lineH +
        gap +
        subLines.length * subSize * lineH +
        (overlay.cta ? gap * 2.5 + ctaBtnH : 0);

      const gradientCoverage = Math.max(blockH + pad * 3, H * 0.38);

      // --- Gradient overlay ---
      const gY = isTop ? 0 : H - gradientCoverage;
      const gradient = ctx.createLinearGradient(0, gY, 0, gY + gradientCoverage);
      if (isTop) {
        gradient.addColorStop(0, "rgba(0,0,0,0.82)");
        gradient.addColorStop(0.55, "rgba(0,0,0,0.60)");
        gradient.addColorStop(0.85, "rgba(0,0,0,0.20)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.15, "rgba(0,0,0,0.20)");
        gradient.addColorStop(0.45, "rgba(0,0,0,0.60)");
        gradient.addColorStop(1, "rgba(0,0,0,0.85)");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, gY, W, gradientCoverage);

      // --- Accent line ---
      const accentH = Math.max(3, Math.round(W * 0.004));
      const accentW = Math.round(W * 0.12);
      const accentY = isTop
        ? pad * 0.8
        : H - gradientCoverage + pad * 0.8;

      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(pad, accentY, accentW, accentH);

      // --- Starting Y for text block ---
      let curY = isTop
        ? accentY + accentH + Math.round(W * 0.022) + headlineSize
        : H - blockH - pad;

      // --- Headline ---
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = Math.round(W * 0.012);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.round(W * 0.003);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 ${headlineSize}px "Helvetica Neue", Arial, sans-serif`;
      ctx.textAlign = "left";
      for (const line of headLines) {
        ctx.fillText(line, pad, curY);
        curY += headlineSize * lineH;
      }

      curY += gap;

      // --- Subheadline ---
      ctx.shadowBlur = Math.round(W * 0.006);
      ctx.shadowOffsetY = Math.round(W * 0.002);
      ctx.fillStyle = "rgba(235,235,235,0.88)";
      ctx.font = `400 ${subSize}px "Helvetica Neue", Arial, sans-serif`;
      for (const line of subLines) {
        ctx.fillText(line, pad, curY);
        curY += subSize * lineH;
      }

      // --- CTA Button ---
      if (overlay.cta) {
        curY += gap * 2;
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = Math.round(W * 0.01);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = Math.round(W * 0.003);

        const btnX = pad;
        const btnY = curY - ctaSize * 0.85;
        const btnR = ctaBtnH * 0.42;

        // Button gradient fill
        const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + ctaBtnH);
        btnGrad.addColorStop(0, "#9B5CF6");
        btnGrad.addColorStop(1, "#6D28D9");

        drawRoundedRect(ctx, btnX, btnY, ctaBtnW, ctaBtnH, btnR);
        ctx.fillStyle = btnGrad;
        ctx.fill();

        // Subtle top highlight on button
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        const highlightGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + ctaBtnH * 0.5);
        highlightGrad.addColorStop(0, "rgba(255,255,255,0.18)");
        highlightGrad.addColorStop(1, "rgba(255,255,255,0)");
        drawRoundedRect(ctx, btnX, btnY, ctaBtnW, ctaBtnH, btnR);
        ctx.fillStyle = highlightGrad;
        ctx.fill();

        // CTA text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `700 ${ctaSize}px "Helvetica Neue", Arial, sans-serif`;
        ctx.textAlign = "left";
        const ctaTextX = btnX + ctaBtnPadX;
        const ctaTextY = btnY + ctaBtnH / 2 + ctaSize * 0.36;
        ctx.fillText(overlay.cta, ctaTextX, ctaTextY);

        // Arrow indicator
        const arrowSize = ctaSize * 0.65;
        const arrowX = btnX + ctaBtnW - ctaBtnPadX * 0.6;
        const arrowY = btnY + ctaBtnH / 2;
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = `700 ${arrowSize}px "Helvetica Neue", Arial, sans-serif`;
        ctx.textAlign = "right";
        ctx.fillText("→", arrowX, arrowY + arrowSize * 0.35);
      }

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = baseImageDataUrl;
  });
}
