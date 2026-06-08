import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type Konva from "konva";
import type { Tool } from "./types";

interface BoardState {
  tool: Tool;
  setTool: (t: Tool) => void;
  color: string;
  setColor: (c: string) => void;
  fillColor: string;
  setFillColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  activePageId: string;
  setActivePageId: (id: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  stageRef: RefObject<Konva.Stage | null>;
}

const Ctx = createContext<BoardState | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState("#0f172a");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [activePageId, setActivePageId] = useState("page-1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const value = useMemo<BoardState>(
    () => ({
      tool,
      setTool,
      color,
      setColor,
      fillColor,
      setFillColor,
      strokeWidth,
      setStrokeWidth,
      activePageId,
      setActivePageId,
      selectedId,
      setSelectedId,
      stageRef,
    }),
    [tool, color, fillColor, strokeWidth, activePageId, selectedId]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBoard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
}
