import { useState, useEffect } from "react";
import type { gameStateType } from "./types/gameStateType";

const App = () => {
  const [gameState, setGameState] = useState<gameStateType>([]);
  const [pressedKey, setPressedKey] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKey(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    switch (pressedKey) {
      case "w":
        setPressedKey("w");
        break;
      case "a":
        setPressedKey("a");
        break;
      case "s":
        setPressedKey("s");
        break;
      case "d":
        setPressedKey("d");
        break;
      default:
        setPressedKey("");
    }
  }, [pressedKey]);

  return (
    <>
      <div className="w-[500px] h-[500px] border">{pressedKey}</div>
    </>
  );
};

export default App;
