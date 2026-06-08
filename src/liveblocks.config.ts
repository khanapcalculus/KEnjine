import { createClient, LiveMap, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { Presence, Shape, PageMeta } from "./types";

const publicApiKey = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY ?? "";

export const hasLiveblocksKey = publicApiKey.startsWith("pk_");

const client = createClient({
  publicApiKey: publicApiKey || "pk_missing_key",
  throttle: 16,
});

export type Storage = {
  pages: LiveMap<string, LiveObject<PageMeta>>;
  shapes: LiveMap<string, LiveObject<Shape>>;
};

type UserMeta = {
  id?: string;
  info?: { name?: string; color?: string };
};

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useOthersMapped,
  useStorage,
  useMutation,
  useHistory,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useStatus,
} = createRoomContext<Presence, Storage, UserMeta>(client);

export { LiveMap, LiveObject };
