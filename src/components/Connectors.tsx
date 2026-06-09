import { Arrow, Text, Group } from "react-konva";
import type { Shape } from "../types";
import { bbox, anchorPoint, bestAnchors, inflate, type Box } from "../lib/geometry";
import { routeOrthogonal } from "../lib/routing";
import { dashFor } from "./shapes/ShapeNode";

interface Props {
  shapes: Shape[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

// Connectors are derived: their path is recomputed every render from the live
// positions of the shapes they link, routing around any shapes in between.
export default function Connectors({ shapes, onSelect, selectedId }: Props) {
  const byId = new Map(shapes.map((s) => [s.id, s]));
  const connectors = shapes.filter((s) => s.type === "connector");
  const obstacleShapes = shapes.filter((s) => s.type !== "connector" && s.type !== "frame");

  return (
    <>
      {connectors.map((c) => {
        const fromShape = c.fromId ? byId.get(c.fromId) : undefined;
        const toShape = c.toId ? byId.get(c.toId) : undefined;

        let fromPt = c.fromPt;
        let toPt = c.toPt;
        if (fromShape && toShape) {
          const fb = bbox(fromShape), tb = bbox(toShape);
          const a = bestAnchors(fb, tb);
          fromPt = anchorPoint(fb, c.fromAnchor ?? a.from);
          toPt = anchorPoint(tb, c.toAnchor ?? a.to);
        } else if (fromShape && toPt) {
          fromPt = anchorPoint(bbox(fromShape), "center");
        } else if (toShape && fromPt) {
          toPt = anchorPoint(bbox(toShape), "center");
        }
        if (!fromPt || !toPt) return null;

        const obstacles: Box[] = obstacleShapes
          .filter((s) => s.id !== c.fromId && s.id !== c.toId)
          .map((s) => inflate(bbox(s), 8));

        const points = routeOrthogonal(fromPt, toPt, obstacles);
        const mid = midpoint(points);
        const selected = selectedId === c.id;

        return (
          <Group key={c.id} onClick={() => onSelect(c.id)} onTap={() => onSelect(c.id)}>
            <Arrow
              points={points}
              stroke={selected ? "#3b82f6" : c.stroke ?? "#64748b"}
              strokeWidth={(c.strokeWidth ?? 2) + (selected ? 1 : 0)}
              dash={dashFor(c.strokeStyle, c.strokeWidth ?? 2)}
              fill={selected ? "#3b82f6" : c.stroke ?? "#64748b"}
              pointerLength={10}
              pointerWidth={10}
              lineCap="round"
              lineJoin="round"
              hitStrokeWidth={14}
              opacity={c.opacity ?? 1}
            />
            {c.label && (
              <Text
                x={mid.x - 60}
                y={mid.y - 10}
                width={120}
                align="center"
                text={c.label}
                fontSize={12}
                fill={c.stroke ?? "#475569"}
                fontFamily="Inter, system-ui, sans-serif"
              />
            )}
          </Group>
        );
      })}
    </>
  );
}

function midpoint(points: number[]): { x: number; y: number } {
  if (points.length < 4) return { x: points[0] ?? 0, y: points[1] ?? 0 };
  const i = Math.floor(points.length / 4) * 2;
  return { x: points[i], y: points[i + 1] };
}
