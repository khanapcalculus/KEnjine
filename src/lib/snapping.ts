import type { Box } from "./geometry";

export interface Guide {
  points: number[];
}
export interface SnapResult {
  x: number;
  y: number;
  guides: Guide[];
}

// Snap a moving box's edges/centers to other boxes, returning the adjusted
// top-left position plus the guide lines to render.
export function computeSnap(moving: Box, others: Box[], threshold: number): SnapResult {
  const mv = lines(moving);
  let bestX: { delta: number; pos: number; at: number; span: [number, number] } | null = null;
  let bestY: { delta: number; pos: number; at: number; span: [number, number] } | null = null;

  for (const o of others) {
    const ov = lines(o);
    // vertical alignment (match x positions)
    for (const a of [mv.left, mv.cx, mv.right]) {
      for (const b of [ov.left, ov.cx, ov.right]) {
        const d = Math.abs(a - b);
        if (d <= threshold && (!bestX || d < bestX.delta)) {
          bestX = { delta: d, pos: b - (a - moving.x), at: b, span: [Math.min(moving.y, o.y), Math.max(moving.y + moving.h, o.y + o.h)] };
        }
      }
    }
    // horizontal alignment (match y positions)
    for (const a of [mv.top, mv.cy, mv.bottom]) {
      for (const b of [ov.top, ov.cy, ov.bottom]) {
        const d = Math.abs(a - b);
        if (d <= threshold && (!bestY || d < bestY.delta)) {
          bestY = { delta: d, pos: b - (a - moving.y), at: b, span: [Math.min(moving.x, o.x), Math.max(moving.x + moving.w, o.x + o.w)] };
        }
      }
    }
  }

  const guides: Guide[] = [];
  let x = moving.x;
  let y = moving.y;
  if (bestX) {
    x = bestX.pos;
    guides.push({ points: [bestX.at, bestX.span[0] - 20, bestX.at, bestX.span[1] + 20] });
  }
  if (bestY) {
    y = bestY.pos;
    guides.push({ points: [bestY.span[0] - 20, bestY.at, bestY.span[1] + 20, bestY.at] });
  }
  return { x, y, guides };
}

function lines(b: Box) {
  return {
    left: b.x, cx: b.x + b.w / 2, right: b.x + b.w,
    top: b.y, cy: b.y + b.h / 2, bottom: b.y + b.h,
  };
}

export function snapToGrid(v: number, size: number): number {
  return Math.round(v / size) * size;
}
