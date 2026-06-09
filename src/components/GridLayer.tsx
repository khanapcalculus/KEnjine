import { Layer, Shape as KShape } from "react-konva";
import type { GridType } from "../types";

interface Props {
  type: GridType;
  size: number;
  color: string;
  viewport: { x: number; y: number; scale: number };
  width: number;
  height: number;
}

// Infinite grid drawn in world space inside the (scaled) stage, so it pans and
// zooms with the board. Uses a single custom-drawn shape for performance.
export default function GridLayer({ type, size, color, viewport, width, height }: Props) {
  if (type === "none") return null;

  const left = -viewport.x / viewport.scale;
  const top = -viewport.y / viewport.scale;
  const right = (width - viewport.x) / viewport.scale;
  const bottom = (height - viewport.y) / viewport.scale;

  // Skip when dots/lines would be too dense to be useful.
  if (size * viewport.scale < 6) return null;

  const startX = Math.floor(left / size) * size;
  const startY = Math.floor(top / size) * size;

  return (
    <Layer listening={false}>
      <KShape
        sceneFunc={(ctx) => {
          ctx.save();
          if (type === "dots") {
            ctx.fillStyle = color;
            const r = 1.1 / viewport.scale;
            for (let x = startX; x <= right; x += size) {
              for (let y = startY; y <= bottom; y += size) {
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1 / viewport.scale;
            ctx.beginPath();
            for (let x = startX; x <= right; x += size) {
              ctx.moveTo(x, top);
              ctx.lineTo(x, bottom);
            }
            for (let y = startY; y <= bottom; y += size) {
              ctx.moveTo(left, y);
              ctx.lineTo(right, y);
            }
            ctx.stroke();
          }
          ctx.restore();
        }}
      />
    </Layer>
  );
}
