import { Group, Rect, Ellipse, Line, Arrow, Text } from "react-konva";
import type Konva from "konva";
import type { Shape } from "../../types";
import URLImage from "./URLImage";

interface Props {
  shape: Shape;
  draggable: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<Shape>) => void;
  onDblClick?: () => void;
}

// Each shape lives in a Group positioned at (x, y); inner geometry is drawn in
// local coordinates so dragging and transforming the group is uniform.
export default function ShapeNode({
  shape,
  draggable,
  onSelect,
  onChange,
  onDblClick,
}: Props) {
  const common = {
    stroke: shape.stroke,
    strokeWidth: shape.strokeWidth,
    opacity: shape.opacity ?? 1,
  };

  let inner = null;
  switch (shape.type) {
    case "pen":
      inner = (
        <Line
          points={shape.points ?? []}
          {...common}
          lineCap="round"
          lineJoin="round"
          tension={0.4}
          hitStrokeWidth={Math.max(12, shape.strokeWidth ?? 4)}
        />
      );
      break;
    case "line":
      inner = (
        <Line points={shape.points ?? []} {...common} lineCap="round" hitStrokeWidth={12} />
      );
      break;
    case "arrow":
      inner = (
        <Arrow
          points={shape.points ?? []}
          {...common}
          fill={shape.stroke}
          pointerLength={12}
          pointerWidth={12}
          hitStrokeWidth={12}
        />
      );
      break;
    case "rect":
      inner = (
        <Rect
          width={shape.width}
          height={shape.height}
          {...common}
          fill={shape.fill === "transparent" ? undefined : shape.fill}
          cornerRadius={4}
        />
      );
      break;
    case "ellipse":
      inner = (
        <Ellipse
          x={(shape.width ?? 0) / 2}
          y={(shape.height ?? 0) / 2}
          radiusX={Math.abs(shape.width ?? 0) / 2}
          radiusY={Math.abs(shape.height ?? 0) / 2}
          {...common}
          fill={shape.fill === "transparent" ? undefined : shape.fill}
        />
      );
      break;
    case "text":
      inner = (
        <Text
          text={shape.text || " "}
          fontSize={shape.fontSize ?? 24}
          fill={shape.stroke}
          width={shape.width}
          fontFamily="Inter, system-ui, sans-serif"
        />
      );
      break;
    case "sticky":
      inner = (
        <>
          <Rect
            width={shape.width}
            height={shape.height}
            fill={shape.fill ?? "#fde68a"}
            cornerRadius={8}
            shadowColor="#000"
            shadowBlur={10}
            shadowOpacity={0.15}
            shadowOffsetY={4}
          />
          <Text
            text={shape.text || ""}
            fontSize={shape.fontSize ?? 18}
            fill="#1f2937"
            width={shape.width}
            height={shape.height}
            padding={12}
            fontFamily="Inter, system-ui, sans-serif"
            wrap="word"
          />
        </>
      );
      break;
    case "image":
      inner = (
        <URLImage src={shape.src ?? ""} width={shape.width ?? 0} height={shape.height ?? 0} />
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
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      onDragEnd={(e) => {
        onChange({ x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Group;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        const patch: Partial<Shape> = {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
        };
        if (shape.points) {
          patch.points = shape.points.map((p, i) =>
            i % 2 === 0 ? p * scaleX : p * scaleY
          );
        } else {
          patch.width = Math.max(5, (shape.width ?? 0) * scaleX);
          patch.height = Math.max(5, (shape.height ?? 0) * scaleY);
        }
        onChange(patch);
      }}
    >
      {inner}
    </Group>
  );
}
