import { useRef } from "react";
import type { Shape } from "../types";

interface Props {
  shapes: Shape[];
  viewport: { x: number; y: number; scale: number };
  tool: string;
  onChange: (id: string, patch: Partial<Shape>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

function embedUrl(s: Shape): string {
  const url = s.url ?? "";
  if (s.mediaType === "youtube") {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
  }
  if (s.mediaType === "vimeo") {
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : url;
  }
  return url;
}

// HTML players positioned over the Konva canvas, synced to the viewport.
export default function MediaOverlay({ shapes, viewport, tool, onChange, onDelete, onSelect }: Props) {
  const media = shapes.filter((s) => s.type === "video" || s.type === "audio" || s.type === "embed");
  return (
    <>
      {media.map((s) => (
        <MediaItem key={s.id} s={s} viewport={viewport} tool={tool} onChange={onChange} onDelete={onDelete} onSelect={onSelect} />
      ))}
    </>
  );
}

function MediaItem({ s, viewport, tool, onChange, onDelete, onSelect }: { s: Shape } & Omit<Props, "shapes">) {
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resize = useRef<{ sx: number; sy: number; ow: number; oh: number } | null>(null);

  const left = viewport.x + s.x * viewport.scale;
  const top = viewport.y + s.y * viewport.scale;
  const w = (s.width ?? 320) * viewport.scale;
  const h = (s.height ?? 200) * viewport.scale;
  const movable = tool === "select";

  function onHeaderDown(e: React.PointerEvent) {
    if (!movable) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: s.x, oy: s.y };
    onSelect(s.id);
  }
  function onHeaderMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.sx) / viewport.scale;
    const dy = (e.clientY - drag.current.sy) / viewport.scale;
    onChange(s.id, { x: drag.current.ox + dx, y: drag.current.oy + dy });
  }
  function endDrag() { drag.current = null; }

  function onResizeDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    resize.current = { sx: e.clientX, sy: e.clientY, ow: s.width ?? 320, oh: s.height ?? 200 };
  }
  function onResizeMove(e: React.PointerEvent) {
    if (!resize.current) return;
    const dw = (e.clientX - resize.current.sx) / viewport.scale;
    const dh = (e.clientY - resize.current.sy) / viewport.scale;
    onChange(s.id, { width: Math.max(120, resize.current.ow + dw), height: Math.max(60, resize.current.oh + dh) });
  }
  function endResize() { resize.current = null; }

  return (
    <div className="media-item" style={{ left, top, width: w, height: h }}>
      <div className="media-header" onPointerDown={onHeaderDown} onPointerMove={onHeaderMove} onPointerUp={endDrag} style={{ cursor: movable ? "move" : "default" }}>
        <span className="media-title">{s.type === "audio" ? "🔊" : "▶"} {s.text || s.mediaType}</span>
        <button className="media-del" onPointerDown={(e) => e.stopPropagation()} onClick={() => onDelete(s.id)}>×</button>
      </div>
      <div className="media-body">
        {s.type === "audio" ? (
          <audio src={s.url} controls style={{ width: "100%" }} />
        ) : s.mediaType === "mp4" ? (
          <video src={s.url} controls style={{ width: "100%", height: "100%" }} />
        ) : (
          <iframe src={embedUrl(s)} title={s.id} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: "100%", height: "100%", border: "none" }} />
        )}
      </div>
      {movable && (
        <div className="media-resize" onPointerDown={onResizeDown} onPointerMove={onResizeMove} onPointerUp={endResize} />
      )}
    </div>
  );
}
