import { useEffect, useState } from "react";
import {
  RoomProvider,
  hasLiveblocksKey,
  LiveMap,
  LiveObject,
} from "./liveblocks.config";
import { BoardProvider } from "./state";
import Board from "./components/Board";
import NamePrompt from "./components/NamePrompt";
import MissingKey from "./components/MissingKey";
import { getRoomId, randomColor, randomName } from "./lib/util";

interface Identity {
  name: string;
  color: string;
}

function loadIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem("kenjine-identity");
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export default function App() {
  const [roomId] = useState(getRoomId);
  const [identity, setIdentity] = useState<Identity | null>(loadIdentity);

  useEffect(() => {
    document.title = "KEnjine — Whiteboard";
  }, []);

  if (!hasLiveblocksKey) {
    return <MissingKey />;
  }

  if (!identity) {
    return (
      <NamePrompt
        defaultName={randomName()}
        defaultColor={randomColor()}
        onSubmit={(id) => {
          localStorage.setItem("kenjine-identity", JSON.stringify(id));
          setIdentity(id);
        }}
      />
    );
  }

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        name: identity.name,
        color: identity.color,
        selectedId: null,
      }}
      initialStorage={{
        pages: new LiveMap<string, LiveObject<{ name: string; order: number }>>([
          ["page-1", new LiveObject({ name: "Page 1", order: 0 })],
        ]),
        shapes: new LiveMap(),
      }}
    >
      <BoardProvider>
        <Board identity={identity} />
      </BoardProvider>
    </RoomProvider>
  );
}
