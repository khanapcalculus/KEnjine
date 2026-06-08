import { nanoid } from "nanoid";

export const USER_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
];

export function pickColor(seed: number) {
  return USER_COLORS[Math.abs(seed) % USER_COLORS.length];
}

export function randomColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

const ADJ = ["Swift", "Bright", "Calm", "Bold", "Keen", "Wise", "Sunny", "Clever"];
const ANIMAL = ["Otter", "Falcon", "Panda", "Lynx", "Heron", "Fox", "Whale", "Koala"];

export function randomName() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const b = ANIMAL[Math.floor(Math.random() * ANIMAL.length)];
  return `${a} ${b}`;
}

// Room id is stored in the URL hash so sharing the link joins the same board.
export function getRoomId(): string {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  let room = params.get("room");
  if (!room) {
    room = "kenjine-" + nanoid(8);
    params.set("room", room);
    window.location.hash = params.toString();
  }
  return room;
}

export function newRoom() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  params.set("room", "kenjine-" + nanoid(8));
  window.location.hash = params.toString();
  window.location.reload();
}
