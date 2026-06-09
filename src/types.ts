export type Tool =
  | "select"
  | "pan"
  | "pen"
  | "highlighter"
  | "rect"
  | "ellipse"
  | "triangle"
  | "diamond"
  | "star"
  | "line"
  | "arrow"
  | "connector"
  | "text"
  | "sticky"
  | "mindnode"
  | "frame"
  | "image"
  | "video"
  | "audio"
  | "embed"
  | "eraser"
  | "laser";

export type ShapeType =
  | "pen"
  | "highlighter"
  | "rect"
  | "ellipse"
  | "triangle"
  | "diamond"
  | "star"
  | "line"
  | "arrow"
  | "connector"
  | "text"
  | "sticky"
  | "mindnode"
  | "frame"
  | "image"
  | "video"
  | "audio"
  | "embed";

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type Anchor = "top" | "right" | "bottom" | "left" | "center";

export type Shape = {
  id: string;
  type: ShapeType;
  pageId: string;
  createdBy: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];
  rotation?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: StrokeStyle;
  fill?: string;
  opacity?: number;
  cornerRadius?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  align?: string;
  src?: string;
  url?: string;
  mediaType?: "youtube" | "vimeo" | "mp4" | "mp3" | "iframe";
  // connector endpoints (attached to shapes by id, or free points)
  fromId?: string;
  fromAnchor?: Anchor;
  toId?: string;
  toAnchor?: Anchor;
  fromPt?: { x: number; y: number };
  toPt?: { x: number; y: number };
  label?: string;
  z?: number;
};

export type PageMeta = {
  name: string;
  order: number;
};

export type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
  selectedId: string | null;
  laser: { x: number; y: number }[] | null;
  viewport: { x: number; y: number; scale: number } | null;
  presenting: boolean;
};

export type GridType = "none" | "dots" | "lines";
export interface GridSettings {
  type: GridType;
  size: number;
  snap: boolean;
}

export type Theme = "light" | "dark";
