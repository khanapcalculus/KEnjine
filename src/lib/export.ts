import type Konva from "konva";
import { jsPDF } from "jspdf";

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function downloadText(text: string, filename: string, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Render the current stage view to a PNG data URL at high resolution.
function stageToPng(stage: Konva.Stage): string {
  return stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
}

export function exportPng(stage: Konva.Stage, name: string) {
  downloadDataUrl(stageToPng(stage), `${name}.png`);
}

export function exportPdf(stage: Konva.Stage, name: string) {
  const dataUrl = stageToPng(stage);
  const width = stage.width();
  const height = stage.height();
  const orientation = width >= height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [width, height] });
  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
  pdf.save(`${name}.pdf`);
}
