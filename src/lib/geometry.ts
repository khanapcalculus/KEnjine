import type { Shape, Anchor } from "../types";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Axis-aligned bounding box of a shape in world coordinates.
export function bbox(s: Shape): Box {
  if (s.points && s.points.length >= 2) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < s.points.length; i += 2) {
      minX = Math.min(minX, s.points[i]);
      maxX = Math.max(maxX, s.points[i]);
      minY = Math.min(minY, s.points[i + 1]);
      maxY = Math.max(maxY, s.points[i + 1]);
    }
    return { x: s.x + minX, y: s.y + minY, w: maxX - minX, h: maxY - minY };
  }
  return { x: s.x, y: s.y, w: s.width ?? 0, h: s.height ?? 0 };
}

export function center(b: Box) {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

export function anchorPoint(b: Box, a: Anchor): { x: number; y: number } {
  switch (a) {
    case "top": return { x: b.x + b.w / 2, y: b.y };
    case "bottom": return { x: b.x + b.w / 2, y: b.y + b.h };
    case "left": return { x: b.x, y: b.y + b.h / 2 };
    case "right": return { x: b.x + b.w, y: b.y + b.h / 2 };
    default: return center(b);
  }
}

// Pick the pair of side anchors that face each other for the cleanest link.
export function bestAnchors(a: Box, b: Box): { from: Anchor; to: Anchor } {
  const ca = center(a), cb = center(b);
  const dx = cb.x - ca.x, dy = cb.y - ca.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? { from: "right", to: "left" } : { from: "left", to: "right" };
  }
  return dy >= 0 ? { from: "bottom", to: "top" } : { from: "top", to: "bottom" };
}

export function inflate(b: Box, m: number): Box {
  return { x: b.x - m, y: b.y - m, w: b.w + 2 * m, h: b.h + 2 * m };
}
