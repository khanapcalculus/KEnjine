import { nanoid } from "nanoid";
import type { Shape } from "../types";

interface Ctx {
  pageId: string;
  createdBy: string;
  cx: number;
  cy: number;
}

const id = () => nanoid(10);

function base(ctx: Ctx, extra: Partial<Shape>): Shape {
  return {
    id: id(),
    type: "rect",
    pageId: ctx.pageId,
    createdBy: ctx.createdBy,
    x: 0,
    y: 0,
    strokeWidth: 2,
    opacity: 1,
    ...extra,
  } as Shape;
}

// 2x2 SWOT matrix with colored quadrants and headers.
export function swotTemplate(ctx: Ctx): Shape[] {
  const w = 260;
  const h = 190;
  const gap = 12;
  const left = ctx.cx - w - gap / 2;
  const top = ctx.cy - h - gap / 2;
  const cells = [
    { t: "STRENGTHS", fill: "#dcfce7", stroke: "#16a34a", dx: 0, dy: 0 },
    { t: "WEAKNESSES", fill: "#fee2e2", stroke: "#dc2626", dx: 1, dy: 0 },
    { t: "OPPORTUNITIES", fill: "#dbeafe", stroke: "#2563eb", dx: 0, dy: 1 },
    { t: "THREATS", fill: "#fef9c3", stroke: "#ca8a04", dx: 1, dy: 1 },
  ];
  const shapes: Shape[] = [];
  for (const c of cells) {
    const x = left + c.dx * (w + gap);
    const y = top + c.dy * (h + gap);
    shapes.push(base(ctx, { type: "rect", x, y, width: w, height: h, fill: c.fill, stroke: c.stroke, cornerRadius: 10 }));
    shapes.push(base(ctx, { type: "text", x: x + 14, y: y + 12, width: w - 28, text: c.t, fontSize: 18, fontWeight: "bold", stroke: c.stroke }));
  }
  return shapes;
}

// Ishikawa / fishbone skeleton: spine + angled bones with category labels.
export function fishboneTemplate(ctx: Ctx): Shape[] {
  const shapes: Shape[] = [];
  const spineY = ctx.cy;
  const x0 = ctx.cx - 320;
  const x1 = ctx.cx + 240;
  // spine
  shapes.push(base(ctx, { type: "arrow", x: 0, y: 0, points: [x0, spineY, x1, spineY], stroke: "#334155", strokeWidth: 3 }));
  // head (problem)
  shapes.push(base(ctx, { type: "rect", x: x1 + 6, y: spineY - 34, width: 150, height: 68, fill: "#fee2e2", stroke: "#dc2626", cornerRadius: 8 }));
  shapes.push(base(ctx, { type: "text", x: x1 + 14, y: spineY - 14, width: 134, text: "Problem / Effect", fontSize: 14, fontWeight: "bold", stroke: "#991b1b", align: "center" }));
  const cats = ["People", "Process", "Equipment", "Materials", "Environment", "Management"];
  const bx = [x0 + 70, x0 + 200, x0 + 330];
  for (let i = 0; i < 6; i++) {
    const col = i % 3;
    const up = i < 3;
    const sx = bx[col];
    const ex = sx + 70;
    const ey = spineY + (up ? -110 : 110);
    shapes.push(base(ctx, { type: "line", x: 0, y: 0, points: [sx, spineY, ex, ey], stroke: "#64748b", strokeWidth: 2 }));
    shapes.push(base(ctx, { type: "text", x: ex - 20, y: ey + (up ? -22 : 6), width: 110, text: cats[i], fontSize: 13, fontWeight: "bold", stroke: "#475569" }));
  }
  return shapes;
}

const NODE_W = 150;
const NODE_H = 50;

export function mindNode(ctx: Ctx, x: number, y: number, text: string, fill: string, w = NODE_W, h = NODE_H): Shape {
  return base(ctx, { type: "mindnode", x, y, width: w, height: h, text, fill, fontSize: 15, strokeWidth: 0 });
}

function connector(ctx: Ctx, fromId: string, toId: string): Shape {
  return base(ctx, { type: "connector", fromId, toId, stroke: "#94a3b8", strokeWidth: 2 });
}

// Central node with four colored children, connected.
export function mindmapTemplate(ctx: Ctx): Shape[] {
  const center = mindNode(ctx, ctx.cx - 80, ctx.cy - 25, "Central Idea", "#1e293b", 160, 56);
  const palette = ["#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];
  const offs = [
    { dx: -260, dy: -120 },
    { dx: 200, dy: -120 },
    { dx: -260, dy: 110 },
    { dx: 200, dy: 110 },
  ];
  const shapes: Shape[] = [center];
  offs.forEach((o, i) => {
    const child = mindNode(ctx, ctx.cx + o.dx, ctx.cy + o.dy, `Idea ${i + 1}`, palette[i]);
    shapes.push(child);
    shapes.push(connector(ctx, center.id, child.id));
  });
  return shapes;
}
