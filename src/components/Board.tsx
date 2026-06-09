import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import TopBar from "./TopBar";
import PagesBar from "./PagesBar";
import StylePanel from "./StylePanel";
import PresentationBar from "./PresentationBar";
import JitsiPanel from "./JitsiPanel";
import { useBoard } from "../state";
import { usePagesMap } from "../hooks/useShapes";
import { useUndo, useRedo, useStatus, useRoom, useOthers } from "../liveblocks.config";
import type { Tool } from "../types";

const KEY_TO_TOOL: Record<string, Tool> = {
  v: "select", h: "pan", p: "pen", l: "line", a: "arrow", r: "rect",
  o: "ellipse", t: "text", s: "sticky", i: "image", e: "eraser", c: "connector",
};

export default function Board({ identity }: { identity: { name: string; color: string } }) {
  const { setTool, activePageId, setActivePageId, presenting, followingId, setFollowingId } = useBoard();
  const pagesMap = usePagesMap();
  const undo = useUndo();
  const redo = useRedo();
  const status = useStatus();
  const room = useRoom();
  const others = useOthers();
  const [callOpen, setCallOpen] = useState(false);

  const followedName = followingId != null ? others.find((o) => o.connectionId === followingId)?.presence.name : null;

  useEffect(() => {
    if (!pagesMap) return;
    if (!pagesMap.has(activePageId)) {
      const first = Array.from(pagesMap, ([id, p]) => ({ id, order: p.order })).sort((a, b) => a.order - b.order)[0];
      if (first) setActivePageId(first.id);
    }
  }, [pagesMap, activePageId, setActivePageId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
      if (!e.ctrlKey && !e.metaKey && !e.altKey) { const t = KEY_TO_TOOL[e.key.toLowerCase()]; if (t) setTool(t); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTool, undo, redo]);

  if (!pagesMap) {
    return (
      <div className="center-screen">
        <div className="loading"><div className="spinner" /><p>{status === "connected" ? "Loading board…" : "Connecting…"}</p></div>
      </div>
    );
  }

  return (
    <div className={"board" + (presenting ? " presenting" : "")}>
      <Canvas me={identity} />

      {!presenting && <TopBar me={identity} callOpen={callOpen} onToggleCall={() => setCallOpen((c) => !c)} />}
      {!presenting && <Toolbar me={identity} />}
      {!presenting && <StylePanel />}
      {!presenting && <PagesBar />}

      {presenting && <PresentationBar />}

      {followedName && (
        <button className="follow-banner" onClick={() => setFollowingId(null)}>
          👁 Following {followedName} · click to stop
        </button>
      )}

      {callOpen && <JitsiPanel room={room.id} name={identity.name} onClose={() => setCallOpen(false)} />}

      {status !== "connected" && <div className="conn-pill">{status === "connecting" ? "Connecting…" : status}</div>}
    </div>
  );
}
