import { Group, Rect, Ellipse, Line, Arrow, Text, Star } from "react-konva";
import type Konva from "konva";
import type { Shape } from "../../types";
import URLImage from "./URLImage";

interface Props {
  shape: Shape;
  draggable: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Shape>) => void;
  onDblClick?: () => void;
  onDragMove?: (node: Konva.Group) => void;
  onDragEndExtra?: () => void;
}

export function dashFor(style: string | undefined, w: number): number[] | undefined {
  if (style === "dashed") return [w * 3, w * 2];
  if (style === "dotted") return [0.01, w * 2];
  return undefined;
}

// Each shape lives in a Group positioned at (x, y); inner geometry is drawn in
// local coordinates so dragging and transforming the group is uniform.
export default function ShapeNode({
  shape,
  draggable,
  onSelect,
  onChange,
  onDblClick,
  onDragMove,
  onDragEndExtra,
}: Props) {
  const w = shape.width ?? 0;
  const h = shape.height ?? 0;
  const dash = dashFor(shape.strokeStyle, shape.strokeWidth ?? 2);
  const common = {
    stroke: shape.stroke,
    strokeWidth: shape.strokeWidth,
    dash,
    lineCap: "round" as const,
    lineJoin: "round" as const,
  };
  const fill = shape.fill === "transparent" ? undefined : shape.fill;

  let inner = null;
  switch (shape.type) {
    case "pen":
      inner = (
        <Line points={shape.points ?? []} {...common} tension={0.4} hitStrokeWidth={Math.max(12, shape.strokeWidth ?? 4)} />
      );
      break;
    case "highlighter":
      inner = (
        <Line
          points={shape.points ?? []}
          stroke={shape.stroke}
          strokeWidth={(shape.strokeWidth ?? 4) * 4}
          opacity={0.35}
          lineCap="round"
          lineJoin="round"
          tension={0.4}
          hitStrokeWidth={20}
        />
      );
      break;
    case "line":
      inner = <Line points={shape.points ?? []} {...common} hitStrokeWidth={12} />;
      break;
    case "arrow":
      inner = (
        <Arrow points={shape.points ?? []} {...common} fill={shape.stroke} pointerLength={12} pointerWidth={12} hitStrokeWidth={12} />
      );
      break;
    case "rect":
      inner = <Rect width={w} height={h} {...common} fill={fill} cornerRadius={shape.cornerRadius ?? 4} />;
      break;
    case "ellipse":
      inner = (
        <Ellipse x={w / 2} y={h / 2} radiusX={Math.abs(w) / 2} radiusY={Math.abs(h) / 2} {...common} fill={fill} />
      );
      break;
    case "triangle":
      inner = <Line points={[w / 2, 0, w, h, 0, h]} closed {...common} fill={fill} />;
      break;
    case "diamond":
      inner = <Line points={[w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]} closed {...common} fill={fill} />;
      break;
    case "star":
      inner = (
        <Star
          x={w / 2}
          y={h / 2}
          numPoints={5}
          innerRadius={Math.min(w, h) / 4}
          outerRadius={Math.min(w, h) / 2}
          {...common}
          fill={fill}
        />
      );
      break;
    case "text":
      inner = (
        <Text text={shape.text || " "} fontSize={shape.fontSize ?? 24} fontStyle={shape.fontWeight} fill={shape.stroke} width={shape.width} align={shape.align} fontFamily="Inter, system-ui, sans-serif" />
      );
      break;
    case "sticky":
      inner = (
        <>
          <Rect width={w} height={h} fill={shape.fill ?? "#fde68a"} cornerRadius={8} shadowColor="#000" shadowBlur={10} shadowOpacity={0.15} shadowOffsetY={4} />
          <Text text={shape.text || ""} fontSize={shape.fontSize ?? 18} fill="#1f2937" width={w} height={h} padding={12} fontFamily="Inter, system-ui, sans-serif" wrap="word" />
        </>
      );
      break;
    case "mindnode":
      inner = (
        <>
          <Rect width={w} height={h} fill={shape.fill ?? "#3b82f6"} cornerRadius={Math.min(h / 2, 16)} stroke={shape.stroke} strokeWidth={shape.strokeWidth} shadowColor="#000" shadowBlur={8} shadowOpacity={0.18} shadowOffsetY={3} />
          <Text text={shape.text || ""} fontSize={shape.fontSize ?? 16} fontStyle="bold" fill={shape.fill && isLight(shape.fill) ? "#1f2937" : "#ffffff"} width={w} height={h} align="center" verticalAlign="middle" padding={8} fontFamily="Inter, system-ui, sans-serif" wrap="word" />
        </>
      );
      break;
    case "frame":
      inner = (
        <>
          <Rect width={w} height={h} fill={fill ?? "rgba(148,163,184,0.06)"} stroke={shape.stroke ?? "#94a3b8"} strokeWidth={shape.strokeWidth ?? 2} dash={[8, 6]} cornerRadius={10} />
          <Text text={shape.text || "Frame"} fontSize={14} fontStyle="bold" fill={shape.stroke ?? "#64748b"} x={6} y={-22} fontFamily="Inter, system-ui, sans-serif" />
        </>
      );
      break;
    case "image":
      inner = <URLImage src={shape.src ?? ""} width={w} height={h} />;
      break;
    case "video":
    case "audio":
    case "embed":
      // Visual placeholder; the actual player is an HTML overlay (MediaOverlay).
      inner = (
        <>
          <Rect width={w} height={h} fill={shape.type === "audio" ? "#ede9fe" : "#0f172a"} cornerRadius={8} stroke="#94a3b8" strokeWidth={1} />
          <Text text={mediaLabel(shape)} fontSize={13} fill={shape.type === "audio" ? "#6d28d9" : "#cbd5e1"} width={w} height={h} align="center" verticalAlign="middle" fontFamily="Inter, system-ui, sans-serif" />
        </>
      );
      break;
  }

  return (
    <Group
      id={shape.id}
      name="shape"
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation ?? 0}
      opacity={shape.opacity ?? 1}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      onDragMove={(e) => onDragMove?.(e.target as Konva.Group)}
      onDragEnd={(e) => { onChange({ x: e.target.x(), y: e.target.y() }); onDragEndExtra?.(); }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Group;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        const patch: Partial<Shape> = { x: node.x(), y: node.y(), rotation: node.rotation() };
        if (shape.points) {
          patch.points = shape.points.map((p, i) => (i % 2 === 0 ? p * scaleX : p * scaleY));
        } else {
          patch.width = Math.max(5, w * scaleX);
          patch.height = Math.max(5, h * scaleY);
        }
        onChange(patch);
      }}
    >
      {inner}
    </Group>
  );
}

function mediaLabel(s: Shape) {
  if (s.type === "audio") return "🔊 " + (s.text || "Audio");
  if (s.type === "embed") return "▶ " + (s.text || "Embed");
  return "▶ " + (s.text || "Video");
}

function isLight(hex: string) {
  const m = hex.replace("#", "");
  if (m.length < 6) return false;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
