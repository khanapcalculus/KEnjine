import { useEffect, useRef } from "react";
import type { Shape } from "../types";

interface Props {
  shape: Shape | undefined;
  viewport: { x: number; y: number; scale: number };
  onChange: (text: string) => void;
  onClose: () => void;
}

// HTML textarea overlaid on the canvas for editing text / sticky notes.
export default function TextEditor({ shape, viewport, onChange, onClose }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  if (!shape) return null;

  const left = viewport.x + shape.x * viewport.scale;
  const top = viewport.y + shape.y * viewport.scale;
  const fontSize = (shape.fontSize ?? 20) * viewport.scale;
  const width = (shape.width ?? 220) * viewport.scale;
  const height = shape.type === "sticky" ? (shape.height ?? 180) * viewport.scale : undefined;
  const isSticky = shape.type === "sticky";

  return (
    <textarea
      ref={ref}
      defaultValue={shape.text ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey && !isSticky)) {
          e.preventDefault();
          onClose();
        }
      }}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        fontSize,
        lineHeight: 1.2,
        padding: isSticky ? 12 * viewport.scale : 0,
        margin: 0,
        border: "none",
        outline: "2px solid #3b82f6",
        borderRadius: isSticky ? 8 : 2,
        background: isSticky ? (shape.fill ?? "#fde68a") : "white",
        color: isSticky ? "#1f2937" : shape.stroke,
        fontFamily: "Inter, system-ui, sans-serif",
        resize: "none",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    />
  );
}
