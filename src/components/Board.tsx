import { useEffect } from "react";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import TopBar from "./TopBar";
import PagesBar from "./PagesBar";
import { useBoard } from "../state";
import { usePagesMap } from "../hooks/useShapes";
import { useUndo, useRedo, useStatus } from "../liveblocks.config";
import type { Tool } from "../types";

const KEY_TO_TOOL: Record<string, Tool> = {
  v: "select",
  h: "pan",
  p: "pen",
  l: "line",
  a: "arrow",
  r: "rect",
  o: "ellipse",
  t: "text",
  s: "sticky",
  i: "image",
  e: "eraser",
};

export default function Board({ identity }: { identity: { name: string; color: string } }) {
  const { setTool, activePageId, setActivePageId } = useBoard();
  const pagesMap = usePagesMap();
  const undo = useUndo();
  const redo = useRedo();
  const status = useStatus();

  // Keep the active page valid as pages change.
  useEffect(() => {
    if (!pagesMap) return;
    if (!pagesMap.has(activePageId)) {
      const first = Array.from(pagesMap, ([id, p]) => ({ id, order: p.order })).sort(
        (a, b) => a.order - b.order
      )[0];
      if (first) setActivePageId(first.id);
    }
  }, [pagesMap, activePageId, setActivePageId]);

  // Tool + undo/redo keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const t = KEY_TO_TOOL[e.key.toLowerCase()];
        if (t) setTool(t);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTool, undo, redo]);

  if (!pagesMap) {
    return (
      <div className="center-screen">
        <div className="loading">
          <div className="spinner" />
          <p>{status === "connected" ? "Loading board…" : "Connecting…"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="board">
      <Canvas me={identity} />
      <TopBar me={identity} />
      <Toolbar me={identity} />
      <PagesBar />
      {status !== "connected" && (
        <div className="conn-pill">{status === "connecting" ? "Connecting…" : status}</div>
      )}
    </div>
  );
}
