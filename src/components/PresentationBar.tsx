import { usePagesMap } from "../hooks/useShapes";
import { useBoard } from "../state";
import { IconChevron, IconClose } from "./Icons";

export default function PresentationBar() {
  const pagesMap = usePagesMap();
  const { activePageId, setActivePageId, setPresenting } = useBoard();

  const pages = pagesMap
    ? Array.from(pagesMap, ([id, p]) => ({ id, ...p })).sort((a, b) => a.order - b.order)
    : [];
  const idx = Math.max(0, pages.findIndex((p) => p.id === activePageId));

  function go(delta: number) {
    const next = pages[idx + delta];
    if (next) setActivePageId(next.id);
  }

  return (
    <div className="present-bar">
      <button className="pb-btn" disabled={idx <= 0} onClick={() => go(-1)} title="Previous">
        <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><IconChevron size={18} /></span>
      </button>
      <span className="pb-count">{idx + 1} / {pages.length}</span>
      <button className="pb-btn" disabled={idx >= pages.length - 1} onClick={() => go(1)} title="Next">
        <IconChevron size={18} />
      </button>
      <div className="pb-sep" />
      <button className="pb-btn exit" onClick={() => setPresenting(false)} title="Exit presentation">
        <IconClose size={16} /> <span>Exit</span>
      </button>
    </div>
  );
}
