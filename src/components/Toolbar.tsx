import { useRef, useState, type ReactNode } from "react";
import { nanoid } from "nanoid";
import { useBoard } from "../state";
import { useShapeMutations } from "../hooks/useShapes";
import { fileToScaledDataUrl } from "../lib/image";
import { swotTemplate, fishboneTemplate, mindmapTemplate } from "../lib/templates";
import type { Tool, Shape } from "../types";
import {
  IconSelect, IconPan, IconPen, IconHighlighter, IconEraser, IconLaser,
  IconShapes, IconRect, IconEllipse, IconTriangle, IconDiamond, IconStar,
  IconLine, IconArrow, IconConnector, IconText, IconSticky, IconMindmap,
  IconFrame, IconImage, IconVideo, IconAudio, IconEmbed, IconChevron,
} from "./Icons";

type IconCmp = (p: { size?: number }) => JSX.Element;
interface Item {
  tool?: Tool;
  label: string;
  Icon: IconCmp;
  action?: () => void;
}

export default function Toolbar({ me }: { me: { name: string } }) {
  const { tool, setTool, activePageId, stageRef, setSelectedId } = useBoard();
  const { addShape, addShapes } = useShapeMutations();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  function viewCenter() {
    const stage = stageRef.current;
    if (!stage) return { cx: 400, cy: 300 };
    return {
      cx: (stage.width() / 2 - stage.x()) / stage.scaleX(),
      cy: (stage.height() / 2 - stage.y()) / stage.scaleY(),
    };
  }

  function insertTemplate(builder: typeof swotTemplate) {
    const { cx, cy } = viewCenter();
    addShapes(builder({ pageId: activePageId, createdBy: me.name, cx, cy }));
    setOpenGroup(null);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const { src, width, height } = await fileToScaledDataUrl(file);
    const { cx, cy } = viewCenter();
    const sid = nanoid(10);
    addShape({ id: sid, type: "image", pageId: activePageId, createdBy: me.name, x: cx - width / 2, y: cy - height / 2, width, height, src });
    setTool("select");
    setSelectedId(sid);
  }

  function addMedia(kind: "video" | "audio" | "embed") {
    const url = window.prompt(
      kind === "audio" ? "Audio URL (.mp3):" : kind === "video" ? "Video URL (YouTube, Vimeo or .mp4):" : "Embed URL (any site):"
    );
    setOpenGroup(null);
    if (!url) return;
    const mediaType = detectMedia(url);
    const { cx, cy } = viewCenter();
    const w = kind === "audio" ? 320 : 480;
    const h = kind === "audio" ? 64 : 270;
    const sid = nanoid(10);
    addShape({ id: sid, type: kind, pageId: activePageId, createdBy: me.name, x: cx - w / 2, y: cy - h / 2, width: w, height: h, url, mediaType, text: url.slice(0, 40) });
    setTool("select");
    setSelectedId(sid);
  }

  function pick(t: Tool) {
    if (t === "image") { fileRef.current?.click(); return; }
    setTool(t);
    setOpenGroup(null);
  }

  const navItems: Item[] = [
    { tool: "select", label: "Select (V)", Icon: IconSelect },
    { tool: "pan", label: "Pan (H)", Icon: IconPan },
  ];
  const drawItems: Item[] = [
    { tool: "pen", label: "Pen (P)", Icon: IconPen },
    { tool: "highlighter", label: "Highlighter", Icon: IconHighlighter },
    { tool: "eraser", label: "Eraser (E)", Icon: IconEraser },
    { tool: "laser", label: "Laser pointer", Icon: IconLaser },
  ];
  const shapeItems: Item[] = [
    { tool: "rect", label: "Rectangle (R)", Icon: IconRect },
    { tool: "ellipse", label: "Ellipse (O)", Icon: IconEllipse },
    { tool: "triangle", label: "Triangle", Icon: IconTriangle },
    { tool: "diamond", label: "Diamond", Icon: IconDiamond },
    { tool: "star", label: "Star", Icon: IconStar },
    { tool: "line", label: "Line (L)", Icon: IconLine },
    { tool: "arrow", label: "Arrow (A)", Icon: IconArrow },
  ];
  const diagramItems: Item[] = [
    { label: "Mind map", Icon: IconMindmap, action: () => insertTemplate(mindmapTemplate) },
    { label: "SWOT analysis", Icon: IconRect, action: () => insertTemplate(swotTemplate) },
    { label: "Fishbone diagram", Icon: IconArrow, action: () => insertTemplate(fishboneTemplate) },
    { tool: "frame", label: "Frame / slide", Icon: IconFrame },
  ];
  const mediaItems: Item[] = [
    { tool: "image", label: "Image (I)", Icon: IconImage },
    { label: "Video", Icon: IconVideo, action: () => addMedia("video") },
    { label: "Audio", Icon: IconAudio, action: () => addMedia("audio") },
    { label: "Embed", Icon: IconEmbed, action: () => addMedia("embed") },
  ];

  return (
    <div className="toolbar">
      {navItems.map((it) => (
        <ToolBtn key={it.tool} active={tool === it.tool} label={it.label} onClick={() => pick(it.tool!)}>
          <it.Icon size={20} />
        </ToolBtn>
      ))}
      <Divider />
      {drawItems.map((it) => (
        <ToolBtn key={it.tool} active={tool === it.tool} label={it.label} onClick={() => pick(it.tool!)}>
          <it.Icon size={20} />
        </ToolBtn>
      ))}
      <Divider />

      <Flyout id="shapes" Icon={IconShapes} label="Shapes" items={shapeItems} active={shapeItems.some((i) => i.tool === tool)} openGroup={openGroup} setOpenGroup={setOpenGroup} onPick={pick} />

      <ToolBtn active={tool === "connector"} label="Connector (auto-route)" onClick={() => pick("connector")}>
        <IconConnector size={20} />
      </ToolBtn>

      <Divider />
      <ToolBtn active={tool === "text"} label="Text (T)" onClick={() => pick("text")}>
        <IconText size={20} />
      </ToolBtn>
      <ToolBtn active={tool === "sticky"} label="Sticky note (S)" onClick={() => pick("sticky")}>
        <IconSticky size={20} />
      </ToolBtn>
      <ToolBtn active={tool === "mindnode"} label="Mind-map node" onClick={() => pick("mindnode")}>
        <IconMindmap size={20} />
      </ToolBtn>

      <Divider />
      <Flyout id="diagrams" Icon={IconFrame} label="Diagrams & templates" items={diagramItems} active={tool === "frame"} openGroup={openGroup} setOpenGroup={setOpenGroup} onPick={pick} />
      <Flyout id="media" Icon={IconVideo} label="Media" items={mediaItems} active={false} openGroup={openGroup} setOpenGroup={setOpenGroup} onPick={pick} />

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
    </div>
  );

  function Flyout({ id, Icon, label, items, active, openGroup, setOpenGroup, onPick }: {
    id: string; Icon: IconCmp; label: string; items: Item[]; active: boolean;
    openGroup: string | null; setOpenGroup: (s: string | null) => void; onPick: (t: Tool) => void;
  }) {
    const open = openGroup === id;
    return (
      <div className="flyout-wrap">
        <button className={"tool-btn flyout-btn" + (active || open ? " active" : "")} title={label} onClick={() => setOpenGroup(open ? null : id)}>
          <Icon size={20} />
          <span className="flyout-caret"><IconChevron size={10} /></span>
        </button>
        {open && (
          <div className="flyout" onMouseLeave={() => setOpenGroup(null)}>
            {items.map((it, i) => (
              <button key={i} className={"flyout-item" + (it.tool && tool === it.tool ? " active" : "")} onClick={() => (it.action ? it.action() : onPick(it.tool!))}>
                <it.Icon size={18} />
                <span>{it.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
}

function ToolBtn({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button className={"tool-btn" + (active ? " active" : "")} title={label} onClick={onClick}>
      {children}
    </button>
  );
}

function Divider() {
  return <div className="toolbar-divider" />;
}

function detectMedia(url: string): Shape["mediaType"] {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.endsWith(".mp4") || u.includes(".mp4?")) return "mp4";
  if (u.endsWith(".mp3") || u.includes(".mp3?")) return "mp3";
  return "iframe";
}
