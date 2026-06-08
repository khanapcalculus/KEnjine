import { useRef, useState } from "react";
import {
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useOthers,
  useMutation,
  useStorage,
  LiveObject,
} from "../liveblocks.config";
import { useBoard } from "../state";
import { newRoom } from "../lib/util";
import { exportPng, exportPdf, downloadText } from "../lib/export";
import type { Shape, PageMeta } from "../types";
import { IconUndo, IconRedo, IconShare, IconDownload, IconTrash } from "./Icons";

export default function TopBar({ me }: { me: { name: string; color: string } }) {
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const others = useOthers();
  const { stageRef, activePageId } = useBoard();
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const pages = useStorage((r) => r.pages);
  const shapes = useStorage((r) => r.shapes);

  const { clearActivePage } = useClearPage(activePageId);
  const loadBoard = useLoadBoard();

  function share() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function doExport(kind: "png" | "pdf") {
    const stage = stageRef.current;
    if (!stage) return;
    if (kind === "png") exportPng(stage, "kenjine-board");
    else exportPdf(stage, "kenjine-board");
    setMenuOpen(false);
  }

  function saveJson() {
    const data = {
      version: 1,
      pages: pages ? Array.from(pages, ([id, p]) => ({ id, ...p })) : [],
      shapes: shapes ? Array.from(shapes, ([, s]) => s) : [],
    };
    downloadText(JSON.stringify(data, null, 2), "kenjine-board.json");
    setMenuOpen(false);
  }

  async function onLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      loadBoard(data);
    } catch {
      alert("Could not read that board file.");
    }
    setMenuOpen(false);
  }

  const everyone = [{ connectionId: -1, name: me.name, color: me.color, self: true }].concat(
    others.map((o) => ({
      connectionId: o.connectionId,
      name: o.presence.name,
      color: o.presence.color,
      self: false,
    }))
  );

  return (
    <div className="topbar">
      <div className="brand">
        <span className="brand-mark">K</span>
        <span className="brand-name">KEnjine</span>
      </div>

      <div className="topbar-group">
        <button className="bar-btn" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">
          <IconUndo size={18} />
        </button>
        <button className="bar-btn" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Y)">
          <IconRedo size={18} />
        </button>
        <button
          className="bar-btn"
          title="Clear this page"
          onClick={() => {
            if (confirm("Clear all shapes on this page?")) clearActivePage();
          }}
        >
          <IconTrash size={18} />
        </button>
      </div>

      <div className="topbar-spacer" />

      <div className="avatars">
        {everyone.slice(0, 6).map((u) => (
          <div
            key={u.connectionId}
            className="avatar"
            style={{ background: u.color }}
            title={u.self ? `${u.name} (you)` : u.name}
          >
            {u.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {everyone.length > 6 && <div className="avatar more">+{everyone.length - 6}</div>}
      </div>

      <button className="bar-btn text-btn" onClick={share} title="Copy room link">
        <IconShare size={18} />
        <span>{copied ? "Copied!" : "Share"}</span>
      </button>

      <div className="menu-wrap">
        <button className="bar-btn text-btn" onClick={() => setMenuOpen((o) => !o)}>
          <IconDownload size={18} />
          <span>Export</span>
        </button>
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

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={onLoadFile}
      />
    </div>
  );
}

function useClearPage(pageId: string) {
  const clearActivePage = useMutation(
    ({ storage }) => {
      const s = storage.get("shapes");
      for (const [id, shape] of Array.from(s.entries())) {
        if (shape.get("pageId") === pageId) s.delete(id);
      }
    },
    [pageId]
  );
  return { clearActivePage };
}

function useLoadBoard() {
  return useMutation(
    (
      { storage },
      data: { pages?: (PageMeta & { id: string })[]; shapes?: Shape[] }
    ) => {
      const pages = storage.get("pages");
      const shapes = storage.get("shapes");
      for (const k of Array.from(pages.keys())) pages.delete(k);
      for (const k of Array.from(shapes.keys())) shapes.delete(k);
      (data.pages ?? []).forEach((p) =>
        pages.set(p.id, new LiveObject({ name: p.name, order: p.order }))
      );
      (data.shapes ?? []).forEach((s) => shapes.set(s.id, new LiveObject(s)));
    },
    []
  );
}
