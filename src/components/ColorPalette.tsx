import { useState } from "react";

// A broad, organized palette (rows of hues × shades) for the expanded view.
export const FULL_PALETTE = [
  "#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6", "#ffffff",
  "#7f1d1d", "#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fee2e2",
  "#7c2d12", "#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5",
  "#713f12", "#ca8a04", "#eab308", "#facc15", "#fde047", "#fef08a", "#fef9c3",
  "#14532d", "#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7",
  "#134e4a", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1",
  "#0c4a6e", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#e0f2fe",
  "#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe",
  "#4c1d95", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe",
  "#831843", "#db2777", "#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8", "#fce7f3",
];

const QUICK = ["#0f172a", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

interface Props {
  value: string;
  onChange: (c: string) => void;
  allowTransparent?: boolean;
  recent?: string[];
}

export default function ColorPalette({ value, onChange, allowTransparent, recent = [] }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="palette">
      <div className="palette-quick">
        {allowTransparent && (
          <button
            className={"swatch-sm none" + (value === "transparent" ? " active" : "")}
            title="No fill"
            onClick={() => onChange("transparent")}
          />
        )}
        {QUICK.map((c) => (
          <button
            key={c}
            className={"swatch-sm" + (value === c ? " active" : "")}
            style={{ background: c, borderColor: c === "#ffffff" ? "#cbd5e1" : "transparent" }}
            title={c}
            onClick={() => onChange(c)}
          />
        ))}
        <label className="swatch-sm custom" title="Custom color">
          <input type="color" value={value === "transparent" ? "#000000" : value} onChange={(e) => onChange(e.target.value)} />
        </label>
        <button className={"palette-expand" + (expanded ? " on" : "")} title="More colors" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "−" : "+"}
        </button>
      </div>

      {expanded && (
        <div className="palette-full">
          {recent.length > 0 && (
            <>
              <div className="palette-label">Recent</div>
              <div className="palette-grid">
                {recent.map((c) => (
                  <button key={"r" + c} className={"swatch-sm" + (value === c ? " active" : "")} style={{ background: c }} onClick={() => onChange(c)} />
                ))}
              </div>
            </>
          )}
          <div className="palette-grid big">
            {FULL_PALETTE.map((c) => (
              <button
                key={c}
                className={"swatch-sm" + (value === c ? " active" : "")}
                style={{ background: c, borderColor: c === "#ffffff" ? "#cbd5e1" : "transparent" }}
                title={c}
                onClick={() => onChange(c)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
