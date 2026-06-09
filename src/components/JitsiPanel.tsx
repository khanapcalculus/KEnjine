import { useRef, useState } from "react";
import { IconClose } from "./Icons";

interface Props {
  room: string;
  name: string;
  onClose: () => void;
}

// Draggable floating Jitsi Meet call, joined to the same board room id.
export default function JitsiPanel({ room, name, onClose }: Props) {
  const [pos, setPos] = useState({ x: window.innerWidth - 380, y: 80 });
  const [min, setMin] = useState(false);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const src =
    `https://meet.jit.si/KEnjine-${encodeURIComponent(room)}` +
    `#userInfo.displayName=%22${encodeURIComponent(name)}%22` +
    `&config.prejoinPageEnabled=false`;

  function down(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  }
  function move(e: React.PointerEvent) {
    if (!drag.current) return;
    setPos({ x: drag.current.ox + (e.clientX - drag.current.sx), y: drag.current.oy + (e.clientY - drag.current.sy) });
  }
  function up() { drag.current = null; }

  return (
    <div className="jitsi-panel" style={{ left: pos.x, top: pos.y, height: min ? 44 : 320 }}>
      <div className="jitsi-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up}>
        <span>📹 Live call</span>
        <div className="jitsi-actions">
          <button onClick={() => setMin((m) => !m)} title={min ? "Expand" : "Minimize"}>{min ? "▢" : "—"}</button>
          <button onClick={onClose} title="End"><IconClose size={14} /></button>
        </div>
      </div>
      {!min && (
        <iframe
          title="Jitsi call"
          src={src}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{ width: "100%", height: "calc(100% - 36px)", border: "none" }}
        />
      )}
    </div>
  );
}
