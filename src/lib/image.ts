// Downscale an image file to a JPEG/PNG data URL bounded by maxDim so it
// stays small enough for Liveblocks storage.
export function fileToScaledDataUrl(
  file: File,
  maxDim = 1280
): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas context"));
        ctx.drawImage(img, 0, 0, width, height);
        const hasAlpha = file.type === "image/png";
        const src = canvas.toDataURL(
          hasAlpha ? "image/png" : "image/jpeg",
          0.85
        );
        resolve({ src, width, height });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
