import { useEffect, useRef, useState, type Ref } from "react";
import { Stage, Layer, Transformer } from "react-konva";
import type Konva from "konva";
import { nanoid } from "nanoid";
import { useBoard } from "../state";
import { useShapesMap, useShapeMutations } from "../hooks/useShapes";
import { useUpdateMyPresence } from "../liveblocks.config";
import type { Shape } from "../types";
import ShapeNode from "./shapes/ShapeNode";
import CursorsLayer from "./CursorsLayer";
import TextEditor from "./TextEditor";

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface Props {
  me: { name: string; color: string };
}

export default function Canvas({ me }: Props) {
  const {
    tool,
    setTool,
    color,
    fillColor,
    strokeWidth,
    activePageId,
    selectedId,
    setSelectedId,
    stageRef,
  } = useBoard();

  const shapesMap = useShapesMap();
  const { addShape, updateShape, deleteShape } = useShapeMutations();
  const updatePresence = useUpdateMyPresence();

  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [draft, setDraft] = useState<Shape | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const drawing = useRef(false);
  const trRef = useRef<Konva.Transformer | null>(null);

  // Active-page shapes as a stable array.
  const shapes: Shape[] = [];
  if (shapesMap) {
    for (const [, s] of shapesMap) {
      if (s.pageId === activePageId) shapes.push(s as Shape);
    }
  }

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Spacebar = temporary pan.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping()) {
        setSpaceHeld(true);
        e.preventDefault();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !isTyping()) {
        deleteShape(selectedId);
        setSelectedId(null);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [selectedId, deleteShape, setSelectedId]);

  // Attach transformer to the selected node.
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    if (selectedId && tool === "select") {
      const node = stage.findOne("#" + selectedId);
      tr.nodes(node ? [node] : []);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selectedId, tool, shapes.length, stageRef]);

  const panning = tool === "pan" || spaceHeld;

  function worldPos(): { x: number; y: number } {
    const stage = stageRef.current!;
    const p = stage.getPointerPosition()!;
    return {
      x: (p.x - viewport.x) / viewport.scale,
      y: (p.y - viewport.y) / viewport.scale,
    };
  }

  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    const stage = stageRef.current!;
    const pointer = stage.getPointerPosition()!;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const scaleBy = 1.06;
      const dir = e.evt.deltaY > 0 ? 1 / scaleBy : scaleBy;
      const newScale = Math.min(8, Math.max(0.1, viewport.scale * dir));
      const wx = (pointer.x - viewport.x) / viewport.scale;
      const wy = (pointer.y - viewport.y) / viewport.scale;
      setViewport({
        scale: newScale,
        x: pointer.x - wx * newScale,
        y: pointer.y - wy * newScale,
      });
    } else {
      setViewport((v) => ({ ...v, x: v.x - e.evt.deltaX, y: v.y - e.evt.deltaY }));
    }
  }

  function handlePointerDown(e: Konva.KonvaEventObject<PointerEvent>) {
    if (panning) return;
    const onEmpty = e.target === e.target.getStage();

    if (tool === "select") {
      if (onEmpty) setSelectedId(null);
      return;
    }
    if (tool === "eraser" || tool === "image") return;

    const { x, y } = worldPos();
    const id = nanoid(10);
    const base: Shape = {
      id,
      type: "pen",
      pageId: activePageId,
      createdBy: me.name,
      x,
      y,
      stroke: color,
      strokeWidth,
      opacity: 1,
    };

    if (tool === "pen") {
      drawing.current = true;
      setDraft({ ...base, type: "pen", x: 0, y: 0, points: [x, y, x, y] });
    } else if (tool === "line" || tool === "arrow") {
      drawing.current = true;
      setDraft({ ...base, type: tool, x: 0, y: 0, points: [x, y, x, y] });
    } else if (tool === "rect" || tool === "ellipse") {
      drawing.current = true;
      setDraft({
        ...base,
        type: tool,
        width: 0,
        height: 0,
        fill: fillColor,
      });
    } else if (tool === "text") {
      const shape: Shape = {
        ...base,
        type: "text",
        text: "",
        fontSize: 24,
        width: 240,
      };
      addShape(shape);
      setSelectedId(id);
      setEditingId(id);
      setTool("select");
    } else if (tool === "sticky") {
      const shape: Shape = {
        ...base,
        type: "sticky",
        text: "",
        fontSize: 18,
        width: 180,
        height: 180,
        fill: "#fde68a",
        stroke: undefined,
      };
      addShape(shape);
      setSelectedId(id);
      setEditingId(id);
      setTool("select");
    }
  }

  function handlePointerMove() {
    const stage = stageRef.current!;
    const p = stage.getPointerPosition();
    if (p) {
      updatePresence({
        cursor: {
          x: (p.x - viewport.x) / viewport.scale,
          y: (p.y - viewport.y) / viewport.scale,
        },
      });
    }
    if (!drawing.current || !draft) return;
    const { x, y } = worldPos();
    if (draft.type === "pen") {
      setDraft({ ...draft, points: [...(draft.points ?? []), x, y] });
    } else if (draft.type === "line" || draft.type === "arrow") {
      const pts = draft.points ?? [0, 0, 0, 0];
      setDraft({ ...draft, points: [pts[0], pts[1], x, y] });
    } else if (draft.type === "rect" || draft.type === "ellipse") {
      setDraft({ ...draft, width: x - draft.x, height: y - draft.y });
    }
  }

  function handlePointerUp() {
    if (drawing.current && draft) {
      // Normalize negative-size rects/ellipses.
      let shape = draft;
      if (
        (shape.type === "rect" || shape.type === "ellipse") &&
        (shape.width! < 0 || shape.height! < 0)
      ) {
        shape = {
          ...shape,
          x: shape.width! < 0 ? shape.x + shape.width! : shape.x,
          y: shape.height! < 0 ? shape.y + shape.height! : shape.y,
          width: Math.abs(shape.width!),
          height: Math.abs(shape.height!),
        };
      }
      const meaningful =
        shape.type === "pen"
          ? (shape.points?.length ?? 0) > 2
          : shape.type === "line" || shape.type === "arrow"
          ? true
          : Math.abs(shape.width ?? 0) > 3 && Math.abs(shape.height ?? 0) > 3;
      if (meaningful) addShape(shape);
    }
    drawing.current = false;
    setDraft(null);
  }

  function onShapeSelect(shape: Shape) {
    if (tool === "eraser") {
      deleteShape(shape.id);
      if (selectedId === shape.id) setSelectedId(null);
      return;
    }
    if (tool === "select") {
      setSelectedId(shape.id);
      updatePresence({ selectedId: shape.id });
    }
  }

  const cursorStyle = panning
    ? "grab"
    : tool === "select"
    ? "default"
    : tool === "eraser"
    ? "cell"
    : "crosshair";

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
        onDragMove={(e) => {
          if (e.target === e.target.getStage()) {
            setViewport((v) => ({ ...v, x: e.target.x(), y: e.target.y() }));
          }
        }}
      >
        <Layer>
          {shapes.map((shape) => (
            <ShapeNode
              key={shape.id}
              shape={shape}
              draggable={tool === "select"}
              onSelect={() => onShapeSelect(shape)}
              onChange={(patch) => updateShape(shape.id, patch)}
              onDblClick={() => {
                if (shape.type === "text" || shape.type === "sticky") {
                  setSelectedId(shape.id);
                  setEditingId(shape.id);
                }
              }}
            />
          ))}
          {draft && (
            <ShapeNode
              shape={draft}
              draggable={false}
              onSelect={() => {}}
              onChange={() => {}}
            />
          )}
          <Transformer
            ref={trRef}
            rotateEnabled
            ignoreStroke
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
            }
          />
        </Layer>
        <CursorsLayer scale={viewport.scale} />
      </Stage>

      {editingId && (
        <TextEditor
          shape={shapes.find((s) => s.id === editingId)!}
          viewport={viewport}
          onChange={(text) => updateShape(editingId, { text })}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

function isTyping() {
  const el = document.activeElement;
  return (
    el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      (el as HTMLElement).isContentEditable)
  );
}
