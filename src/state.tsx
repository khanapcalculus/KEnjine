import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type Konva from "konva";
import type { Tool, StrokeStyle, GridSettings, Theme } from "./types";

interface BoardState {
  tool: Tool;
  setTool: (t: Tool) => void;
  color: string;
  setColor: (c: string) => void;
  fillColor: string;
  setFillColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  strokeStyle: StrokeStyle;
  setStrokeStyle: (s: StrokeStyle) => void;
  opacity: number;
  setOpacity: (o: number) => void;
  recentColors: string[];
  pushRecentColor: (c: string) => void;
  activePageId: string;
  setActivePageId: (id: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  theme: Theme;
  toggleTheme: () => void;
  grid: GridSettings;
  setGrid: (g: GridSettings) => void;
  followingId: number | null;
  setFollowingId: (id: number | null) => void;
  presenting: boolean;
  setPresenting: (p: boolean) => void;
  stageRef: RefObject<Konva.Stage | null>;
}

const Ctx = createContext<BoardState | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState("#0f172a");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [opacity, setOpacity] = useState(1);
  const [recentColors, setRecentColors] = useState<string[]>(() =>
    load<string[]>("kenjine-recent-colors", [])
  );
  const [activePageId, setActivePageId] = useState("page-1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => load<Theme>("kenjine-theme", "light"));
  const [grid, setGrid] = useState<GridSettings>(() =>
    load<GridSettings>("kenjine-grid", { type: "dots", size: 26, snap: false })
  );
  const [followingId, setFollowingId] = useState<number | null>(null);
  const [presenting, setPresenting] = useState(false);
  const stageRef = useRef<Konva.Stage | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("kenjine-theme", JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("kenjine-grid", JSON.stringify(grid));
  }, [grid]);

  function pushRecentColor(c: string) {
    setRecentColors((prev) => {
      const next = [c, ...prev.filter((x) => x !== c)].slice(0, 10);
      localStorage.setItem("kenjine-recent-colors", JSON.stringify(next));
      return next;
    });
  }

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
      strokeStyle,
      setStrokeStyle,
      opacity,
      setOpacity,
      recentColors,
      pushRecentColor,
      activePageId,
      setActivePageId,
      selectedId,
      setSelectedId,
      theme,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      grid,
      setGrid,
      followingId,
      setFollowingId,
      presenting,
      setPresenting,
      stageRef,
    }),
    [
      tool,
      color,
      fillColor,
      strokeWidth,
      strokeStyle,
      opacity,
      recentColors,
      activePageId,
      selectedId,
      theme,
      grid,
      followingId,
      presenting,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBoard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBoard must be used within BoardProvider");
  return ctx;
}
