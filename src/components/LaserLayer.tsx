import { Layer, Line, Circle } from "react-konva";
import { useOthersMapped } from "../liveblocks.config";

interface Props {
  scale: number;
  ownPoints: { x: number; y: number }[] | null;
  ownColor: string;
}

function trail(points: { x: number; y: number }[], color: string, scale: number, key: string) {
  if (!points || points.length === 0) return null;
  const flat: number[] = [];
  for (const p of points) flat.push(p.x, p.y);
  const head = points[points.length - 1];
  return (
    <Layer key={key} listening={false}>
      {points.length > 1 && (
        <Line
          points={flat}
          stroke={color}
          strokeWidth={4 / scale}
          opacity={0.55}
          lineCap="round"
          lineJoin="round"
          tension={0.5}
          shadowColor={color}
          shadowBlur={12 / scale}
        />
      )}
      <Circle x={head.x} y={head.y} radius={6 / scale} fill={color} shadowColor={color} shadowBlur={20 / scale} />
    </Layer>
  );
}

// Renders the local user's laser plus every remote laser trail (from presence).
export default function LaserLayer({ scale, ownPoints, ownColor }: Props) {
  const others = useOthersMapped((o) => ({ laser: o.presence.laser, color: o.presence.color }));
  return (
    <>
      {trail(ownPoints ?? [], ownColor, scale, "self")}
      {others.map(([id, d]) => (d.laser && d.laser.length ? trail(d.laser, d.color, scale, "l" + id) : null))}
    </>
  );
}
