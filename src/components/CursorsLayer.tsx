import { Layer, Group, Path, Text, Rect } from "react-konva";
import { useOthersMapped } from "../liveblocks.config";

interface Props {
  scale: number;
}

// Remote cursors rendered inside the scaled stage so they track world coords.
export default function CursorsLayer({ scale }: Props) {
  const others = useOthersMapped((other) => ({
    cursor: other.presence.cursor,
    name: other.presence.name,
    color: other.presence.color,
  }));

  const inv = 1 / scale;

  return (
    <Layer listening={false}>
      {others.map(([connectionId, data]) => {
        if (!data.cursor) return null;
        return (
          <Group
            key={connectionId}
            x={data.cursor.x}
            y={data.cursor.y}
            scaleX={inv}
            scaleY={inv}
          >
            <Path
              data="M0,0 L0,18 L5,13 L9,21 L12,19 L8,12 L15,12 Z"
              fill={data.color}
              stroke="white"
              strokeWidth={1}
            />
            <Rect x={14} y={14} width={data.name.length * 7 + 12} height={20} fill={data.color} cornerRadius={4} />
            <Text
              x={20}
              y={18}
              text={data.name}
              fontSize={12}
              fill="white"
              fontFamily="Inter, system-ui, sans-serif"
            />
          </Group>
        );
      })}
    </Layer>
  );
}
