import { useState, useEffect } from "react";
import type { gameStateType } from "./types/gameStateType";

const App = () => {
  const [pressedKey, setPressedKey] = useState("");
  const [score, setScore] = useState(0);
  const boardSize = 4;
  const [gameWon, setGameWon] = useState(false);

  function createEmptyBoard() {
    return Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(0));
  }

  function addRandomTile(board: number[][]) {
    const emptyCells = [];
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[row][col] = Math.random() < 0.8 ? 2 : 4;
    }
    return board;
  }

  function initializeBoard() {
    const board = createEmptyBoard();
    addRandomTile(board);
    addRandomTile(board);
    return board;
  }

  const [gameState, setGameState] = useState<gameStateType>([
    { boardState: initializeBoard(), scoreState: 0 },
  ]);

  function moveLeft(board: number[][]) {
    let scoreGain = 0;
    const newBoard = board.map((row) => {
      const filtered = row.filter((cell) => cell !== 0);
      const merged = [];
      let i = 0;
      while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const mergedValue = filtered[i] * 2;
          merged.push(mergedValue);
          scoreGain += mergedValue;
          i += 2;
        } else {
          merged.push(filtered[i]);
          i += 1;
        }
      }
      while (merged.length < boardSize) {
        merged.push(0);
      }
      return merged;
    });
    return { board: newBoard, scoreGain };
  }

  function transpose(matrix: number[][]) {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]));
  }

  function reverseRows(matrix: number[][]) {
    return matrix.map((row) => [...row].reverse());
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKey(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function makeMove(direction: string) {
    const currBoard = gameState[gameState.length - 1].boardState;
    let workingBoard = currBoard.map((row) => [...row]);
    let result;

    switch (direction) {
      case "w": // Up
        workingBoard = transpose(workingBoard);
        result = moveLeft(workingBoard);
        workingBoard = transpose(result.board);
        break;
      case "a": // Left
        result = moveLeft(workingBoard);
        workingBoard = result.board;
        break;
      case "s": // Down
        workingBoard = transpose(workingBoard);
        workingBoard = reverseRows(workingBoard);
        result = moveLeft(workingBoard);
        workingBoard = reverseRows(result.board);
        workingBoard = transpose(workingBoard);
        break;
      case "d": // Right
        workingBoard = reverseRows(workingBoard);
        result = moveLeft(workingBoard);
        workingBoard = reverseRows(result.board);
        break;
      default:
        return;
    }

    // Check if board actually changed
    const boardChanged =
      JSON.stringify(currBoard) !== JSON.stringify(workingBoard);

    if (boardChanged) {
      addRandomTile(workingBoard);
      setScore((prev) => prev + result.scoreGain);
      setGameState((prev) => [
        ...prev,
        { boardState: workingBoard, scoreState: score + result.scoreGain },
      ]);

      // Check for 128 tile (game win condition)
      const has128 = workingBoard.flat().includes(128);
      if (has128) {
        setGameWon(true);
      }
    }
  }

  function goToPreviousBoard() {
    if (gameState.length > 1) {
      const newGameState = gameState.slice(0, -1);
      setGameState(newGameState);
      setScore(newGameState[newGameState.length - 1].scoreState);
    }
  }

  useEffect(() => {
    if (!gameWon && pressedKey && ["w", "a", "s", "d"].includes(pressedKey)) {
      makeMove(pressedKey);
      setPressedKey("");
    }
  }, [pressedKey, gameWon]);

  const currentBoard = gameState[gameState.length - 1].boardState;

  function getCellColor(value: number) {
    const colors: Record<number, string> = {
      2: "bg-gray-100",
      4: "bg-gray-200",
      8: "bg-orange-200",
      16: "bg-orange-300",
      32: "bg-orange-400",
      64: "bg-red-300",
      128: "bg-yellow-300",
      256: "bg-yellow-400",
      512: "bg-yellow-500",
      1024: "bg-yellow-600",
      2048: "bg-red-500",
    };
    return colors[value] || "bg-purple-500";
  }

  return (
    <div className="p-4">
      <div className="text-2xl font-bold mb-4">2048</div>
      <div className="text-lg mb-4">Score: {score}</div>
      {gameWon && (
        <div className="mb-4 p-4 bg-green-200 rounded text-center">
          <div className="text-xl font-bold text-green-800">
            Congratulations!
          </div>
          <div className="text-green-700">You reached 128! You won!</div>
        </div>
      )}
      <div className="bg-gray-400 p-2 rounded grid grid-cols-4 gap-2 w-[500px] h-[500px]">
        {currentBoard.flat().map((cell, index) => (
          <div
            key={index}
            className={`${
              cell === 0 ? "bg-gray-300" : getCellColor(cell)
            } flex items-center justify-center text-2xl font-bold rounded w-[115px] h-[115px]`}
          >
            {cell !== 0 ? cell : ""}
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Use WASD keys to play: W (up), A (left), S (down), D (right)
      </div>
      <div className="mt-4 flex justify-start">
        <button
          onClick={goToPreviousBoard}
          disabled={gameState.length <= 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

export default App;
