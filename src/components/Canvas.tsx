import { useEffect, useRef, useState, type Ref } from "react";
import { Stage, Layer, Transformer, Line } from "react-konva";
import type Konva from "konva";
import { nanoid } from "nanoid";
import { useBoard } from "../state";
import { useShapesMap, useShapeMutations } from "../hooks/useShapes";
import { useUpdateMyPresence, useOthersMapped } from "../liveblocks.config";
import type { Shape } from "../types";
import ShapeNode from "./shapes/ShapeNode";
import Connectors from "./Connectors";
import CursorsLayer from "./CursorsLayer";
import GridLayer from "./GridLayer";
import LaserLayer from "./LaserLayer";
import MediaOverlay from "./MediaOverlay";
import TextEditor from "./TextEditor";
import { bbox, type Box } from "../lib/geometry";
import { computeSnap, snapToGrid } from "../lib/snapping";

interface Viewport { x: number; y: number; scale: number }
interface Props { me: { name: string; color: string } }

export default function Canvas({ me }: Props) {
  const b = useBoard();
  const { tool, setTool, color, fillColor, strokeWidth, strokeStyle, opacity, activePageId, selectedId, setSelectedId, grid, theme, stageRef, presenting, followingId, setFollowingId } = b;

  const shapesMap = useShapesMap();
  const { addShape, updateShape, deleteShape } = useShapeMutations();
  const updatePresence = useUpdateMyPresence();

  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [draft, setDraft] = useState<Shape | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [guides, setGuides] = useState<number[][]>([]);
  const [connectStart, setConnectStart] = useState<string | null>(null);
  const [ownLaser, setOwnLaser] = useState<{ x: number; y: number; t: number }[]>([]);
  const drawing = useRef(false);
  const laserActive = useRef(false);
  const trRef = useRef<Konva.Transformer | null>(null);

  const shapes: Shape[] = [];
  if (shapesMap) for (const [, s] of shapesMap) if (s.pageId === activePageId) shapes.push(s as Shape);
  const byId = new Map(shapes.map((s) => [s.id, s]));

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Broadcast viewport for follow-presenter.
  useEffect(() => { updatePresence({ viewport }); }, [viewport, updatePresence]);

  // Follow another user's viewport.
  const othersVp = useOthersMapped((o) => o.presence.viewport);
  useEffect(() => {
    if (followingId == null) return;
    const e = othersVp.find(([id]) => id === followingId);
    if (e && e[1]) setViewport(e[1]);
  }, [othersVp, followingId]);

  // Laser fade-out loop.
  useEffect(() => {
    if (ownLaser.length === 0) return;
    const iv = setInterval(() => {
      setOwnLaser((pts) => {
        const now = performance.now();
        const kept = pts.filter((p) => now - p.t < 650);
        updatePresence({ laser: kept.length ? kept.map(({ x, y }) => ({ x, y })) : null });
        return kept;
      });
    }, 60);
    return () => clearInterval(iv);
  }, [ownLaser.length, updatePresence]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping()) { setSpaceHeld(true); e.preventDefault(); }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !isTyping()) {
        deleteShape(selectedId);
        setSelectedId(null);
      }
      if (e.key === "Escape") { setConnectStart(null); setEditingId(null); }
    };
    const up = (e: KeyboardEvent) => { if (e.code === "Space") setSpaceHeld(false); };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [selectedId, deleteShape, setSelectedId]);

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const sel = selectedId ? byId.get(selectedId) : undefined;
    const transformable = sel && sel.type !== "connector" && sel.type !== "video" && sel.type !== "audio" && sel.type !== "embed";
    if (selectedId && tool === "select" && transformable) {
      const node = stage.findOne("#" + selectedId);
      tr.nodes(node ? [node] : []);
    } else tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, tool, shapes.length, stageRef]);

  const panning = tool === "pan" || spaceHeld;

  function worldPos(): { x: number; y: number } {
    const stage = stageRef.current!;
    const p = stage.getPointerPosition()!;
    return { x: (p.x - viewport.x) / viewport.scale, y: (p.y - viewport.y) / viewport.scale };
  }
  function snapPt(p: { x: number; y: number }) {
    return grid.snap ? { x: snapToGrid(p.x, grid.size), y: snapToGrid(p.y, grid.size) } : p;
  }
  function baseStyle(): Partial<Shape> {
    return { stroke: color, strokeWidth, strokeStyle, fill: fillColor, opacity };
  }

  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    if (followingId != null) setFollowingId(null);
    const stage = stageRef.current!;
    const pointer = stage.getPointerPosition()!;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const dir = e.evt.deltaY > 0 ? 1 / 1.06 : 1.06;
      const newScale = Math.min(8, Math.max(0.1, viewport.scale * dir));
      const wx = (pointer.x - viewport.x) / viewport.scale;
      const wy = (pointer.y - viewport.y) / viewport.scale;
      setViewport({ scale: newScale, x: pointer.x - wx * newScale, y: pointer.y - wy * newScale });
    } else {
      setViewport((v) => ({ ...v, x: v.x - e.evt.deltaX, y: v.y - e.evt.deltaY }));
    }
  }

  function handlePointerDown(e: Konva.KonvaEventObject<PointerEvent>) {
    if (panning) return;
    const onEmpty = e.target === e.target.getStage();

    if (tool === "laser") {
      laserActive.current = true;
      const p = worldPos();
      setOwnLaser([{ ...p, t: performance.now() }]);
      return;
    }
    if (tool === "select") { if (onEmpty) { setSelectedId(null); updatePresence({ selectedId: null }); } return; }
    if (tool === "eraser" || tool === "image" || tool === "connector") return;

    const wp = snapPt(worldPos());
    const id = nanoid(10);
    const common: Shape = { id, type: "pen", pageId: activePageId, createdBy: me.name, x: wp.x, y: wp.y, ...baseStyle() };

    if (tool === "pen" || tool === "highlighter") {
      drawing.current = true;
      setDraft({ ...common, type: tool, x: 0, y: 0, points: [wp.x, wp.y, wp.x, wp.y] });
    } else if (tool === "line" || tool === "arrow") {
      drawing.current = true;
      setDraft({ ...common, type: tool, x: 0, y: 0, points: [wp.x, wp.y, wp.x, wp.y] });
    } else if (tool === "rect" || tool === "ellipse" || tool === "triangle" || tool === "diamond" || tool === "star" || tool === "frame") {
      drawing.current = true;
      setDraft({ ...common, type: tool === "frame" ? "frame" : tool, width: 0, height: 0, ...(tool === "frame" ? { fill: "transparent", text: "Frame" } : {}) });
    } else if (tool === "text") {
      addShape({ ...common, type: "text", text: "", fontSize: 24, width: 240 });
      finishPlace(id); setEditingId(id);
    } else if (tool === "sticky") {
      addShape({ ...common, type: "sticky", text: "", fontSize: 18, width: 180, height: 180, fill: "#fde68a", stroke: undefined });
      finishPlace(id); setEditingId(id);
    } else if (tool === "mindnode") {
      addShape({ ...common, type: "mindnode", text: "", fontSize: 16, width: 150, height: 50, fill: fillColor !== "transparent" ? fillColor : "#3b82f6", strokeWidth: 0, x: wp.x - 75, y: wp.y - 25 });
      finishPlace(id); setEditingId(id);
    }
  }

  function finishPlace(id: string) { setSelectedId(id); setTool("select"); }

  function handlePointerMove() {
    const stage = stageRef.current!;
    const p = stage.getPointerPosition();
    if (p) {
      const wx = (p.x - viewport.x) / viewport.scale;
      const wy = (p.y - viewport.y) / viewport.scale;
      updatePresence({ cursor: { x: wx, y: wy } });
      if (laserActive.current) {
        setOwnLaser((pts) => {
          const next = [...pts, { x: wx, y: wy, t: performance.now() }].slice(-48);
          updatePresence({ laser: next.map(({ x, y }) => ({ x, y })) });
          return next;
        });
      }
    }
    if (!drawing.current || !draft) return;
    const wp = worldPos();
    if (draft.type === "pen" || draft.type === "highlighter") {
      setDraft({ ...draft, points: [...(draft.points ?? []), wp.x, wp.y] });
    } else if (draft.type === "line" || draft.type === "arrow") {
      const pts = draft.points ?? [0, 0, 0, 0];
      setDraft({ ...draft, points: [pts[0], pts[1], wp.x, wp.y] });
    } else {
      const sp = snapPt(wp);
      setDraft({ ...draft, width: sp.x - draft.x, height: sp.y - draft.y });
    }
  }

  function handlePointerUp() {
    if (laserActive.current) laserActive.current = false;
    if (drawing.current && draft) {
      let shape = draft;
      if (shape.width !== undefined && shape.height !== undefined && (shape.width < 0 || shape.height < 0)) {
        shape = { ...shape, x: shape.width < 0 ? shape.x + shape.width : shape.x, y: shape.height < 0 ? shape.y + shape.height : shape.y, width: Math.abs(shape.width), height: Math.abs(shape.height) };
      }
      const ok =
        shape.type === "pen" || shape.type === "highlighter" ? (shape.points?.length ?? 0) > 2 :
        shape.type === "line" || shape.type === "arrow" ? true :
        Math.abs(shape.width ?? 0) > 3 && Math.abs(shape.height ?? 0) > 3;
      if (ok) addShape(shape);
    }
    drawing.current = false;
    setDraft(null);
  }

  function onShapeClick(shape: Shape) {
    if (tool === "eraser") { deleteShape(shape.id); if (selectedId === shape.id) setSelectedId(null); return; }
    if (tool === "connector") {
      if (!connectStart) setConnectStart(shape.id);
      else if (connectStart !== shape.id) {
        addShape({ id: nanoid(10), type: "connector", pageId: activePageId, createdBy: me.name, x: 0, y: 0, fromId: connectStart, toId: shape.id, stroke: color, strokeWidth: 2, strokeStyle });
        setConnectStart(null);
        setTool("select");
      }
      return;
    }
    if (tool === "select") { setSelectedId(shape.id); updatePresence({ selectedId: shape.id }); }
  }

  // Live alignment + grid snapping while dragging.
  function onShapeDragMove(node: Konva.Group) {
    if (tool !== "select") return;
    const shape = byId.get(node.id());
    if (!shape) return;
    const bb = bbox(shape);
    const w = bb.w, h = bb.h;
    let x = node.x(), y = node.y();
    if (grid.snap) { x = snapToGrid(x, grid.size); y = snapToGrid(y, grid.size); }
    const others: Box[] = shapes.filter((s) => s.id !== shape.id && s.type !== "connector").map((s) => bbox(s));
    const snap = computeSnap({ x, y, w, h }, others, 6 / viewport.scale);
    node.x(snap.x); node.y(snap.y);
    setGuides(snap.guides.map((g) => g.points));
  }

  const cursorStyle = panning ? "grab" : tool === "select" ? "default" : tool === "eraser" ? "cell" : tool === "laser" ? "none" : "crosshair";

  return (
    <div className="canvas-wrap" style={{ cursor: cursorStyle }}>
      <Stage
        ref={stageRef as Ref<Konva.Stage>}
        width={size.w}
        height={size.h}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        draggable={panning}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => updatePresence({ cursor: null })}
        onDragStart={() => { if (followingId != null) setFollowingId(null); }}
        onDragMove={(e) => { if (e.target === e.target.getStage()) setViewport((v) => ({ ...v, x: e.target.x(), y: e.target.y() })); }}
      >
        <GridLayer type={grid.type} size={grid.size} color={theme === "dark" ? "#243049" : "#dbe2ea"} viewport={viewport} width={size.w} height={size.h} />
        <Layer>
          <Connectors shapes={shapes} onSelect={(id) => onShapeClick(byId.get(id)!)} selectedId={selectedId} />
          {shapes.filter((s) => s.type !== "connector").map((shape) => (
            <ShapeNode
              key={shape.id}
              shape={shape}
              draggable={tool === "select" && shape.type !== "video" && shape.type !== "audio" && shape.type !== "embed"}
              onSelect={() => onShapeClick(shape)}
              onChange={(patch) => updateShape(shape.id, patch)}
              onDragMove={onShapeDragMove}
              onDragEndExtra={() => setGuides([])}
              onDblClick={() => { if (["text", "sticky", "mindnode", "frame"].includes(shape.type)) { setSelectedId(shape.id); setEditingId(shape.id); } }}
            />
          ))}
          {draft && <ShapeNode shape={draft} draggable={false} onSelect={() => {}} onChange={() => {}} />}
          <Transformer ref={trRef} rotateEnabled ignoreStroke boundBoxFunc={(o, n) => (n.width < 5 || n.height < 5 ? o : n)} />
        </Layer>
        {guides.length > 0 && (
          <Layer listening={false}>
            {guides.map((pts, i) => (
              <Line key={i} points={pts} stroke="#ec4899" strokeWidth={1 / viewport.scale} dash={[4 / viewport.scale, 4 / viewport.scale]} />
            ))}
          </Layer>
        )}
        <LaserLayer scale={viewport.scale} ownPoints={ownLaser.map(({ x, y }) => ({ x, y }))} ownColor={me.color} />
        <CursorsLayer scale={viewport.scale} />
      </Stage>

      <MediaOverlay shapes={shapes} viewport={viewport} tool={tool} onChange={updateShape} onDelete={(id) => { deleteShape(id); if (selectedId === id) setSelectedId(null); }} onSelect={(id) => { setSelectedId(id); updatePresence({ selectedId: id }); }} />

      {editingId && byId.get(editingId) && (
        <TextEditor shape={byId.get(editingId)} viewport={viewport} onChange={(text) => updateShape(editingId, { text })} onClose={() => setEditingId(null)} />
      )}

      {connectStart && <div className="hint-pill">Click a target shape to connect · Esc to cancel</div>}
      {!presenting && tool === "laser" && <div className="hint-pill">Drag to point · others see your laser</div>}
    </div>
  );
}

function isTyping() {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);
}
