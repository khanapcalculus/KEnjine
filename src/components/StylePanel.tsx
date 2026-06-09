import { useBoard } from "../state";
import { useShapesMap, useShapeMutations } from "../hooks/useShapes";
import ColorPalette from "./ColorPalette";
import type { Shape, StrokeStyle } from "../types";

const WIDTHS = [1, 2, 4, 8, 14];
const STYLES: StrokeStyle[] = ["solid", "dashed", "dotted"];

export default function StylePanel() {
  const b = useBoard();
  const shapesMap = useShapesMap();
  const { updateShape } = useShapeMutations();

  const selected: Shape | undefined =
    b.selectedId && shapesMap ? (shapesMap.get(b.selectedId) as Shape | undefined) : undefined;

  // Effective values reflect the selected shape, else the active drawing style.
  const stroke = selected?.stroke ?? b.color;
  const fill = selected?.fill ?? b.fillColor;
  const width = selected?.strokeWidth ?? b.strokeWidth;
  const style = (selected?.strokeStyle ?? b.strokeStyle) as StrokeStyle;
  const opacity = selected?.opacity ?? b.opacity;
  const hasText = selected && ["text", "sticky", "mindnode"].includes(selected.type);
  const fontSize = selected?.fontSize ?? 18;

  function apply(patch: Partial<Shape>) {
    if (selected) updateShape(selected.id, patch);
  }

  return (
    <div className="style-panel">
      <div className="sp-section">
        <div className="sp-label">Stroke</div>
        <ColorPalette
          value={stroke}
          recent={b.recentColors}
          onChange={(c) => {
            b.setColor(c);
            b.pushRecentColor(c);
            apply({ stroke: c });
          }}
        />
      </div>

      <div className="sp-section">
        <div className="sp-label">Fill</div>
        <ColorPalette
          value={fill}
          allowTransparent
          recent={b.recentColors}
          onChange={(c) => {
            b.setFillColor(c);
            if (c !== "transparent") b.pushRecentColor(c);
            apply({ fill: c });
          }}
        />
      </div>

      <div className="sp-row">
        <div className="sp-col">
          <div className="sp-label">Width</div>
          <div className="sp-widths">
            {WIDTHS.map((w) => (
              <button
                key={w}
                className={"sp-width" + (width === w ? " active" : "")}
                onClick={() => {
                  b.setStrokeWidth(w);
                  apply({ strokeWidth: w });
                }}
              >
                <span style={{ width: w + 4, height: w + 4 }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sp-row">
        <div className="sp-col">
          <div className="sp-label">Style</div>
          <div className="sp-styles">
            {STYLES.map((s) => (
              <button
                key={s}
                className={"sp-style" + (style === s ? " active" : "")}
                onClick={() => {
                  b.setStrokeStyle(s);
                  apply({ strokeStyle: s });
                }}
              >
                <span className={"line-" + s} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sp-row">
        <div className="sp-col">
          <div className="sp-label">Opacity · {Math.round(opacity * 100)}%</div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => {
              const o = parseFloat(e.target.value);
              b.setOpacity(o);
              apply({ opacity: o });
            }}
          />
        </div>
      </div>

      {hasText && (
        <div className="sp-row">
          <div className="sp-col">
            <div className="sp-label">Font size · {fontSize}</div>
            <input
              type="range"
              min={10}
              max={64}
              step={1}
              value={fontSize}
              onChange={(e) => apply({ fontSize: parseInt(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
