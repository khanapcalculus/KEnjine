import { useMutation, useStorage, LiveObject } from "../liveblocks.config";
import type { Shape, PageMeta } from "../types";

export function useShapesMap() {
  return useStorage((root) => root.shapes);
}

export function usePagesMap() {
  return useStorage((root) => root.pages);
}

export function useShapeMutations() {
  const addShape = useMutation(({ storage }, shape: Shape) => {
    storage.get("shapes").set(shape.id, new LiveObject(shape));
  }, []);

  const addShapes = useMutation(({ storage }, shapes: Shape[]) => {
    const map = storage.get("shapes");
    for (const shape of shapes) map.set(shape.id, new LiveObject(shape));
  }, []);

  const updateShape = useMutation(
    ({ storage }, id: string, patch: Partial<Shape>) => {
      const s = storage.get("shapes").get(id);
      if (s) s.update(patch);
    },
    []
  );

  const deleteShape = useMutation(({ storage }, id: string) => {
    storage.get("shapes").delete(id);
  }, []);

  const clearPage = useMutation(({ storage }, pageId: string) => {
    const shapes = storage.get("shapes");
    for (const [id, s] of Array.from(shapes.entries())) {
      if (s.get("pageId") === pageId) shapes.delete(id);
    }
  }, []);

  return { addShape, addShapes, updateShape, deleteShape, clearPage };
}

export function usePageMutations() {
  const addPage = useMutation(({ storage }, id: string, meta: PageMeta) => {
    storage.get("pages").set(id, new LiveObject(meta));
  }, []);

  const renamePage = useMutation(({ storage }, id: string, name: string) => {
    const p = storage.get("pages").get(id);
    if (p) p.set("name", name);
  }, []);

  const deletePage = useMutation(({ storage }, id: string) => {
    const pages = storage.get("pages");
    if (pages.size <= 1) return;
    pages.delete(id);
    const shapes = storage.get("shapes");
    for (const [sid, s] of Array.from(shapes.entries())) {
      if (s.get("pageId") === id) shapes.delete(sid);
    }
  }, []);

  return { addPage, renamePage, deletePage };
}
