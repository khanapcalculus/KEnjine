import type { Box } from "./geometry";

type Pt = { x: number; y: number };

const uniq = (arr: number[]) => Array.from(new Set(arr.map((n) => Math.round(n)))).sort((a, b) => a - b);

function segHitsRect(ax: number, ay: number, bx: number, by: number, r: Box): boolean {
  // Only axis-aligned segments are produced. Inset the rect slightly so a path
  // running exactly along an obstacle edge is allowed.
  const x1 = r.x + 0.5, y1 = r.y + 0.5, x2 = r.x + r.w - 0.5, y2 = r.y + r.h - 0.5;
  if (x2 <= x1 || y2 <= y1) return false;
  if (ay === by) {
    if (ay <= y1 || ay >= y2) return false;
    const lo = Math.min(ax, bx), hi = Math.max(ax, bx);
    return hi > x1 && lo < x2;
  } else {
    if (ax <= x1 || ax >= x2) return false;
    const lo = Math.min(ay, by), hi = Math.max(ay, by);
    return hi > y1 && lo < y2;
  }
}

function passable(a: Pt, b: Pt, obstacles: Box[]): boolean {
  for (const r of obstacles) if (segHitsRect(a.x, a.y, b.x, b.y, r)) return false;
  return true;
}

function simplify(pts: Pt[]): number[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    if (i > 0 && i < pts.length - 1) {
      const p = pts[i - 1], c = pts[i], n = pts[i + 1];
      const col = (p.x === c.x && c.x === n.x) || (p.y === c.y && c.y === n.y);
      if (col) continue;
    }
    out.push(pts[i]);
  }
  const flat: number[] = [];
  for (const p of out) flat.push(p.x, p.y);
  return flat;
}

/**
 * Orthogonal connector routing with obstacle avoidance via A* on a Hanan grid
 * built from the endpoints and the obstacle margins. Falls back to a simple
 * elbow if the graph search fails.
 */
export function routeOrthogonal(from: Pt, to: Pt, obstacles: Box[], margin = 14): number[] {
  // Limit obstacles to those near the from→to region for performance.
  const minX = Math.min(from.x, to.x) - 200, maxX = Math.max(from.x, to.x) + 200;
  const minY = Math.min(from.y, to.y) - 200, maxY = Math.max(from.y, to.y) + 200;
  const obs = obstacles.filter((r) => r.x + r.w >= minX && r.x <= maxX && r.y + r.h >= minY && r.y <= maxY);

  if (obs.length === 0 || passableElbow(from, to, obs)) {
    return elbow(from, to);
  }

  const xs = uniq([
    from.x, to.x,
    ...obs.flatMap((r) => [r.x - margin, r.x + r.w + margin]),
    (from.x + to.x) / 2,
  ]);
  const ys = uniq([
    from.y, to.y,
    ...obs.flatMap((r) => [r.y - margin, r.y + r.h + margin]),
    (from.y + to.y) / 2,
  ]);

  const nodes: Pt[] = [];
  const index = new Map<string, number>();
  for (let j = 0; j < ys.length; j++)
    for (let i = 0; i < xs.length; i++) {
      index.set(i + "," + j, nodes.length);
      nodes.push({ x: xs[i], y: ys[j] });
    }

  const startI = xs.indexOf(Math.round(from.x)), startJ = ys.indexOf(Math.round(from.y));
  const endI = xs.indexOf(Math.round(to.x)), endJ = ys.indexOf(Math.round(to.y));
  if (startI < 0 || endI < 0) return elbow(from, to);

  const start = index.get(startI + "," + startJ)!;
  const goal = index.get(endI + "," + endJ)!;

  const h = (n: number) => Math.abs(nodes[n].x - to.x) + Math.abs(nodes[n].y - to.y);
  const open = new Set<number>([start]);
  const came = new Map<number, number>();
  const g = new Map<number, number>([[start, 0]]);
  const f = new Map<number, number>([[start, h(start)]]);
  const ij = (n: number) => ({ i: n % xs.length, j: Math.floor(n / xs.length) });

  while (open.size) {
    let cur = -1, best = Infinity;
    for (const n of open) if ((f.get(n) ?? Infinity) < best) { best = f.get(n)!; cur = n; }
    if (cur === goal) break;
    open.delete(cur);
    const { i, j } = ij(cur);
    const neigh = [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]];
    for (const [ni, nj] of neigh) {
      if (ni < 0 || nj < 0 || ni >= xs.length || nj >= ys.length) continue;
      const nn = index.get(ni + "," + nj)!;
      if (!passable(nodes[cur], nodes[nn], obs)) continue;
      const turn = came.has(cur) ? turnPenalty(nodes[came.get(cur)!], nodes[cur], nodes[nn]) : 0;
      const tentative = (g.get(cur) ?? Infinity) + dist(nodes[cur], nodes[nn]) + turn;
      if (tentative < (g.get(nn) ?? Infinity)) {
        came.set(nn, cur);
        g.set(nn, tentative);
        f.set(nn, tentative + h(nn));
        open.add(nn);
      }
    }
  }

  if (!came.has(goal) && start !== goal) return elbow(from, to);
  const path: Pt[] = [];
  let n: number | undefined = goal;
  while (n !== undefined) { path.unshift(nodes[n]); n = came.get(n); }
  return simplify(path);
}

function dist(a: Pt, b: Pt) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
function turnPenalty(a: Pt, b: Pt, c: Pt) {
  const d1x = Math.sign(b.x - a.x), d1y = Math.sign(b.y - a.y);
  const d2x = Math.sign(c.x - b.x), d2y = Math.sign(c.y - b.y);
  return d1x === d2x && d1y === d2y ? 0 : 20;
}

function elbow(from: Pt, to: Pt): number[] {
  const midX = (from.x + to.x) / 2;
  return simplify([from, { x: midX, y: from.y }, { x: midX, y: to.y }, to]);
}

function passableElbow(from: Pt, to: Pt, obs: Box[]): boolean {
  const midX = (from.x + to.x) / 2;
  const pts = [from, { x: midX, y: from.y }, { x: midX, y: to.y }, to];
  for (let i = 0; i < pts.length - 1; i++) if (!passable(pts[i], pts[i + 1], obs)) return false;
  return true;
}
