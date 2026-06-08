import { useState } from "react";
import { nanoid } from "nanoid";
import { usePagesMap, usePageMutations } from "../hooks/useShapes";
import { useBoard } from "../state";
import { IconPlus, IconTrash } from "./Icons";

export default function PagesBar() {
  const pagesMap = usePagesMap();
  const { addPage, renamePage, deletePage } = usePageMutations();
  const { activePageId, setActivePageId } = useBoard();
  const [editing, setEditing] = useState<string | null>(null);

  const pages = pagesMap
    ? Array.from(pagesMap, ([id, p]) => ({ id, ...p })).sort((a, b) => a.order - b.order)
    : [];

  function add() {
    const id = "page-" + nanoid(6);
    const order = pages.length ? Math.max(...pages.map((p) => p.order)) + 1 : 0;
    addPage(id, { name: `Page ${pages.length + 1}`, order });
    setActivePageId(id);
  }

  return (
    <div className="pagesbar">
      {pages.map((p) => (
        <div
          key={p.id}
          className={"page-tab" + (p.id === activePageId ? " active" : "")}
          onClick={() => setActivePageId(p.id)}
          onDoubleClick={() => setEditing(p.id)}
        >
          {editing === p.id ? (
            <input
              autoFocus
              defaultValue={p.name}
              onBlur={(e) => {
                renamePage(p.id, e.target.value.trim() || p.name);
                setEditing(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <span>{p.name}</span>
          )}
          {pages.length > 1 && (
            <button
              className="page-del"
              title="Delete page"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${p.name}"?`)) {
                  if (activePageId === p.id) {
                    const other = pages.find((x) => x.id !== p.id);
                    if (other) setActivePageId(other.id);
                  }
                  deletePage(p.id);
                }
              }}
            >
              <IconTrash size={13} />
            </button>
          )}
        </div>
      ))}
      <button className="page-add" onClick={add} title="Add page">
        <IconPlus size={16} />
      </button>
    </div>
  );
}
