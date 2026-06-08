import { useRef } from "react";
import { nanoid } from "nanoid";
import { useBoard } from "../state";
import { useShapeMutations } from "../hooks/useShapes";
import { fileToScaledDataUrl } from "../lib/image";
import type { Tool } from "../types";
import {
  IconSelect,
  IconPan,
  IconPen,
  IconLine,
  IconArrow,
  IconRect,
  IconEllipse,
  IconText,
  IconSticky,
  IconImage,
  IconEraser,
} from "./Icons";

const TOOLS: { tool: Tool; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { tool: "select", label: "Select (V)", Icon: IconSelect },
  { tool: "pan", label: "Pan (H)", Icon: IconPan },
  { tool: "pen", label: "Pen (P)", Icon: IconPen },
  { tool: "line", label: "Line (L)", Icon: IconLine },
  { tool: "arrow", label: "Arrow (A)", Icon: IconArrow },
  { tool: "rect", label: "Rectangle (R)", Icon: IconRect },
  { tool: "ellipse", label: "Ellipse (O)", Icon: IconEllipse },
  { tool: "text", label: "Text (T)", Icon: IconText },
  { tool: "sticky", label: "Sticky note (S)", Icon: IconSticky },
  { tool: "image", label: "Image (I)", Icon: IconImage },
  { tool: "eraser", label: "Eraser (E)", Icon: IconEraser },
];

const COLORS = ["#0f172a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff"];
const WIDTHS = [2, 4, 8, 16];

export default function Toolbar({ me }: { me: { name: string } }) {
  const {
    tool,
    setTool,
    color,
    setColor,
    strokeWidth,
    setStrokeWidth,
    fillColor,
    setFillColor,
    activePageId,
    stageRef,
    setSelectedId,
  } = useBoard();
  const { addShape } = useShapeMutations();
  const fileRef = useRef<HTMLInputElement | null>(null);

  function pickTool(t: Tool) {
    if (t === "image") {
      fileRef.current?.click();
      return;
    }
    setTool(t);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const { src, width, height } = await fileToScaledDataUrl(file);
    const stage = stageRef.current;
    let wx = 200,
      wy = 200;
    if (stage) {
      wx = (stage.width() / 2 - stage.x()) / stage.scaleX() - width / 2;
      wy = (stage.height() / 2 - stage.y()) / stage.scaleY() - height / 2;
    }
    const id = nanoid(10);
    addShape({
      id,
      type: "image",
      pageId: activePageId,
      createdBy: me.name,
      x: wx,
      y: wy,
      width,
      height,
      src,
    });
    setTool("select");
    setSelectedId(id);
  }

  return (
    <div className="toolbar">
      {TOOLS.map(({ tool: t, label, Icon }) => (
        <button
          key={t}
          className={"tool-btn" + (tool === t ? " active" : "")}
          title={label}
          onClick={() => pickTool(t)}
        >
          <Icon size={20} />
        </button>
      ))}

      <div className="toolbar-divider" />

      <div className="color-row">
        {COLORS.map((c) => (
          <button
            key={c}
            className={"color-dot" + (color === c ? " active" : "")}
            style={{ background: c, outlineColor: c === "#ffffff" ? "#cbd5e1" : "transparent" }}
            title={c}
            onClick={() => setColor(c)}
          />
        ))}
        <label className="color-dot custom" title="Custom color">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
      </div>

      <div className="width-row">
        {WIDTHS.map((w) => (
          <button
            key={w}
            className={"width-btn" + (strokeWidth === w ? " active" : "")}
            title={`${w}px`}
            onClick={() => setStrokeWidth(w)}
          >
            <span style={{ width: w + 6, height: w + 6 }} />
          </button>
        ))}
      </div>

      <button
        className={"fill-btn" + (fillColor !== "transparent" ? " active" : "")}
        title="Toggle shape fill"
        onClick={() => setFillColor(fillColor === "transparent" ? color : "transparent")}
      >
        Fill
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFile}
      />
    </div>
  );
}
