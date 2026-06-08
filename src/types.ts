export type Tool =
  | "select"
  | "pan"
  | "pen"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "sticky"
  | "image"
  | "eraser";

export type ShapeType =
  | "pen"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "text"
  | "sticky"
  | "image";

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
  fill?: string;
  opacity?: number;
  text?: string;
  fontSize?: number;
  src?: string;
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
};
