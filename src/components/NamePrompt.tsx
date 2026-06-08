import { useState } from "react";
import { USER_COLORS } from "../lib/util";

interface Props {
  defaultName: string;
  defaultColor: string;
  onSubmit: (id: { name: string; color: string }) => void;
}

export default function NamePrompt({ defaultName, defaultColor, onSubmit }: Props) {
  const [name, setName] = useState(defaultName);
  const [color, setColor] = useState(defaultColor);

  return (
    <div className="center-screen">
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = name.trim() || defaultName;
          onSubmit({ name: trimmed, color });
        }}
      >
        <h1>KEnjine</h1>
        <p className="muted">Join the board — pick a name and color</p>
        <label className="field">
          <span>Display name</span>
          <input
            autoFocus
            value={name}
            maxLength={24}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>
        <div className="field">
          <span>Color</span>
          <div className="swatches">
            {USER_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                className={"swatch" + (c === color ? " selected" : "")}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={c}
              />
            ))}
          </div>
        </div>
        <button type="submit" className="primary-btn">
          Enter board
        </button>
      </form>
    </div>
  );
}
