import { createClient, LiveMap, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { Presence, Shape, PageMeta } from "./types";

// Liveblocks PUBLIC keys are client-side keys, safe to ship in the browser.
// Prefer the build-time env var / GitHub secret; fall back to the project's
// public key so the app works out of the box. Restrict allowed origins in the
// Liveblocks dashboard to prevent quota abuse.
const FALLBACK_PUBLIC_KEY = "pk_dev_3vb9_B_hhn8BWwim4ZWS4b5-rbnyMeikTc8nKYFqdM3ZJxwOZsFjSB1Stei-guqt";

const publicApiKey = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY || FALLBACK_PUBLIC_KEY;

export const hasLiveblocksKey = publicApiKey.startsWith("pk_");

const client = createClient({
  publicApiKey,
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
