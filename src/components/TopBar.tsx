import { useRef, useState } from "react";
import {
  useUndo, useRedo, useCanUndo, useCanRedo, useOthers, useMutation, useStorage, LiveObject,
} from "../liveblocks.config";
import { useBoard } from "../state";
import { newRoom } from "../lib/util";
import { exportPng, exportPdf, downloadText } from "../lib/export";
import type { Shape, PageMeta, GridType } from "../types";
import {
  IconUndo, IconRedo, IconShare, IconDownload, IconTrash, IconSun, IconMoon,
  IconGrid, IconPresent, IconPhone,
} from "./Icons";

export default function TopBar({ me, callOpen, onToggleCall }: { me: { name: string; color: string }; callOpen: boolean; onToggleCall: () => void }) {
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const others = useOthers();
  const b = useBoard();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const pages = useStorage((r) => r.pages);
  const shapes = useStorage((r) => r.shapes);
  const clearActivePage = useClearPage(b.activePageId);
  const loadBoard = useLoadBoard();

  function share() {
    navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }
  function doExport(kind: "png" | "pdf") {
    const stage = b.stageRef.current; if (!stage) return;
    kind === "png" ? exportPng(stage, "kenjine-board") : exportPdf(stage, "kenjine-board");
    setMenuOpen(false);
  }
  function saveJson() {
    const data = { version: 2, pages: pages ? Array.from(pages, ([id, p]) => ({ id, ...p })) : [], shapes: shapes ? Array.from(shapes, ([, s]) => s) : [] };
    downloadText(JSON.stringify(data, null, 2), "kenjine-board.json");
    setMenuOpen(false);
  }
  async function onLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    try { loadBoard(JSON.parse(await file.text())); } catch { alert("Could not read that board file."); }
    setMenuOpen(false);
  }
  function setGrid(type: GridType) { b.setGrid({ ...b.grid, type }); }

  const everyone = [{ connectionId: -1, name: me.name, color: me.color, self: true }].concat(
    others.map((o) => ({ connectionId: o.connectionId, name: o.presence.name, color: o.presence.color, self: false }))
  );

  return (
    <div className="topbar">
      <div className="brand"><span className="brand-mark">K</span><span className="brand-name">KEnjine</span></div>

      <div className="topbar-group">
        <button className="bar-btn" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)"><IconUndo size={18} /></button>
        <button className="bar-btn" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Y)"><IconRedo size={18} /></button>
        <button className="bar-btn" title="Clear page" onClick={() => { if (confirm("Clear all shapes on this page?")) clearActivePage(); }}><IconTrash size={18} /></button>
      </div>

      <div className="topbar-group">
        <div className="menu-wrap">
          <button className={"bar-btn" + (b.grid.type !== "none" ? " on" : "")} onClick={() => setGridOpen((o) => !o)} title="Grid"><IconGrid size={18} /></button>
          {gridOpen && (
            <div className="menu" onMouseLeave={() => setGridOpen(false)}>
              <button className={b.grid.type === "none" ? "sel" : ""} onClick={() => setGrid("none")}>No grid</button>
              <button className={b.grid.type === "dots" ? "sel" : ""} onClick={() => setGrid("dots")}>Dots</button>
              <button className={b.grid.type === "lines" ? "sel" : ""} onClick={() => setGrid("lines")}>Lines</button>
              <label className="menu-check"><input type="checkbox" checked={b.grid.snap} onChange={(e) => b.setGrid({ ...b.grid, snap: e.target.checked })} /> Snap to grid</label>
            </div>
          )}
        </div>
        <button className="bar-btn" onClick={b.toggleTheme} title="Toggle theme">{b.theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}</button>
      </div>

      <div className="topbar-spacer" />

      <div className="avatars">
        {everyone.slice(0, 6).map((u) => (
          <button key={u.connectionId} className="avatar" style={{ background: u.color }} title={u.self ? `${u.name} (you)` : `Follow ${u.name}`}
            onClick={() => { if (!u.self) b.setFollowingId(u.connectionId); }}>
            {u.name.charAt(0).toUpperCase()}
          </button>
        ))}
        {everyone.length > 6 && <div className="avatar more">+{everyone.length - 6}</div>}
      </div>

      <button className={"bar-btn text-btn" + (callOpen ? " on" : "")} onClick={onToggleCall} title="Live A/V call"><IconPhone size={18} /><span>{callOpen ? "End" : "Call"}</span></button>
      <button className="bar-btn text-btn present" onClick={() => b.setPresenting(true)} title="Present"><IconPresent size={18} /><span>Present</span></button>
      <button className="bar-btn text-btn" onClick={share} title="Copy room link"><IconShare size={18} /><span>{copied ? "Copied!" : "Share"}</span></button>

      <div className="menu-wrap">
        <button className="bar-btn text-btn" onClick={() => setMenuOpen((o) => !o)}><IconDownload size={18} /><span>Export</span></button>
        {menuOpen && (
          <div className="menu" onMouseLeave={() => setMenuOpen(false)}>
            <button onClick={() => doExport("png")}>Export PNG</button>
            <button onClick={() => doExport("pdf")}>Export PDF</button>
            <button onClick={saveJson}>Save board (.json)</button>
            <button onClick={() => fileRef.current?.click()}>Load board (.json)</button>
            <button onClick={newRoom}>New board</button>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={onLoadFile} />
    </div>
  );
}

function useClearPage(pageId: string) {
  return useMutation(({ storage }) => {
    const s = storage.get("shapes");
    for (const [id, shape] of Array.from(s.entries())) if (shape.get("pageId") === pageId) s.delete(id);
  }, [pageId]);
}

function useLoadBoard() {
  return useMutation(({ storage }, data: { pages?: (PageMeta & { id: string })[]; shapes?: Shape[] }) => {
    const pages = storage.get("pages");
    const shapes = storage.get("shapes");
    for (const k of Array.from(pages.keys())) pages.delete(k);
    for (const k of Array.from(shapes.keys())) shapes.delete(k);
    (data.pages ?? []).forEach((p) => pages.set(p.id, new LiveObject({ name: p.name, order: p.order })));
    (data.shapes ?? []).forEach((s) => shapes.set(s.id, new LiveObject(s)));
  }, []);
}
