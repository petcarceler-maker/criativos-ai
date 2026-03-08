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
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
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

      // Draw base image scaled to fill
      ctx.drawImage(img, 0, 0, dims.width, dims.height);

      const padding = dims.width * 0.08;
      const maxTextWidth = dims.width - padding * 2;
      const isTop = overlay.textPosition === "top";

      // Calculate text sizes relative to canvas
      const headlineSize = Math.round(dims.width * 0.065);
      const subheadlineSize = Math.round(dims.width * 0.035);
      const ctaSize = Math.round(dims.width * 0.032);
      const ctaPaddingX = Math.round(dims.width * 0.04);
      const ctaPaddingY = Math.round(dims.width * 0.018);
      const lineSpacing = 1.3;

      // Measure all text to calculate overlay height
      ctx.font = `bold ${headlineSize}px "Inter", "Helvetica Neue", Arial, sans-serif`;
      const headlineLines = wrapText(ctx, overlay.headline, maxTextWidth);

      ctx.font = `${subheadlineSize}px "Inter", "Helvetica Neue", Arial, sans-serif`;
      const subheadlineLines = wrapText(ctx, overlay.subheadline, maxTextWidth);

      const totalTextHeight =
        headlineLines.length * headlineSize * lineSpacing +
        subheadlineLines.length * subheadlineSize * lineSpacing +
        (overlay.cta ? ctaSize + ctaPaddingY * 2 + dims.width * 0.03 : 0) +
        dims.width * 0.04; // spacing between elements

      const overlayHeight = totalTextHeight + padding * 2;

      // Draw semi-transparent background
      const gradientY = isTop ? 0 : dims.height - overlayHeight;
      const gradient = ctx.createLinearGradient(0, gradientY, 0, gradientY + overlayHeight);
      if (isTop) {
        gradient.addColorStop(0, "rgba(0, 0, 0, 0.75)");
        gradient.addColorStop(0.8, "rgba(0, 0, 0, 0.5)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.2, "rgba(0, 0, 0, 0.5)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.75)");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, gradientY, dims.width, overlayHeight);

      // Starting Y position for text
      let currentY: number;
      if (isTop) {
        currentY = padding + headlineSize;
      } else {
        currentY = dims.height - overlayHeight + padding + headlineSize;
      }

      // Draw headline
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${headlineSize}px "Inter", "Helvetica Neue", Arial, sans-serif`;
      ctx.textAlign = "center";
      const centerX = dims.width / 2;

      // Text shadow for readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      for (const line of headlineLines) {
        ctx.fillText(line, centerX, currentY);
        currentY += headlineSize * lineSpacing;
      }

      // Spacing between headline and subheadline
      currentY += dims.width * 0.01;

      // Draw subheadline
      ctx.font = `${subheadlineSize}px "Inter", "Helvetica Neue", Arial, sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.shadowBlur = 4;

      for (const line of subheadlineLines) {
        ctx.fillText(line, centerX, currentY);
        currentY += subheadlineSize * lineSpacing;
      }

      // Draw CTA button
      if (overlay.cta) {
        currentY += dims.width * 0.025;

        ctx.font = `bold ${ctaSize}px "Inter", "Helvetica Neue", Arial, sans-serif`;
        const ctaMetrics = ctx.measureText(overlay.cta);
        const btnWidth = ctaMetrics.width + ctaPaddingX * 2;
        const btnHeight = ctaSize + ctaPaddingY * 2;
        const btnX = centerX - btnWidth / 2;
        const btnY = currentY - ctaSize * 0.2;

        // Reset shadow for button
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        // Button background with rounded corners
        const radius = btnHeight * 0.35;
        ctx.beginPath();
        ctx.moveTo(btnX + radius, btnY);
        ctx.lineTo(btnX + btnWidth - radius, btnY);
        ctx.quadraticCurveTo(btnX + btnWidth, btnY, btnX + btnWidth, btnY + radius);
        ctx.lineTo(btnX + btnWidth, btnY + btnHeight - radius);
        ctx.quadraticCurveTo(btnX + btnWidth, btnY + btnHeight, btnX + btnWidth - radius, btnY + btnHeight);
        ctx.lineTo(btnX + radius, btnY + btnHeight);
        ctx.quadraticCurveTo(btnX, btnY + btnHeight, btnX, btnY + btnHeight - radius);
        ctx.lineTo(btnX, btnY + radius);
        ctx.quadraticCurveTo(btnX, btnY, btnX + radius, btnY);
        ctx.closePath();
        ctx.fillStyle = "#7C3AED"; // brand purple
        ctx.fill();

        // Button text
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText(overlay.cta, centerX, btnY + btnHeight / 2 + ctaSize * 0.35);
      }

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = baseImageDataUrl;
  });
}
