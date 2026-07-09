// src/components/captcha/CrosswordCaptcha.tsx
// Click-only crossword: tap a cell to highlight its word (and its clue),
// then tap letter tiles to fill it in order — no keyboard input. A word
// that fills up wrong just sits there (no red) until cleared and redone;
// a correct word locks green and the next unfinished word auto-selects.
// `problem.level` (1~5) is the only thing that changes between difficulty
// tiers — this one component renders all five, it never forks by level.
// Not wired into the main game's chapters/categories — API-only captcha type.
//
// State lives in one useReducer instead of several useState calls: every
// action (select/click-tile/clear) needs to read filled+activeWord+completed
// together and update them together, and two clicks fired back to back
// (e.g. a fast double-tap, or React batching) must each see the *other's*
// result — separate useState closures would let the second click compute
// its "next empty cell" from stale state and land on the same cell twice.
import { useEffect, useMemo, useReducer, useRef } from "react";
import { shuffle } from "../../utils/random";
import type { CrosswordProblem, CrosswordWordSlot, CaptchaHandlers } from "./types";

interface Props extends CaptchaHandlers {
  problem: CrosswordProblem;
}

const COLORS = {
  primary: "#EF6F5C",
  primaryLight: "#FFE8E3",
  border: "#FFD9CD",
  text: "#3A2E2A",
  subtext: "#A6968F",
  active: "#A65B8C",
  activeLight: "#F5ECF1",
  done: "#4CAF7D",
  doneLight: "#E8F8EF",
  locked: "#8E7CC3",
  lockedLight: "#EDE9F7",
};

const CELL_SIZE = 42;

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

interface BankTile {
  // Stable identity, independent of the tile's current position in `bank`.
  // A click handler captures this id in its closure at render time; if two
  // clicks fire before React re-renders between them (a fast double-tap, or
  // just React batching), the *second* handler's array-index would already
  // be wrong once the first click's dispatch removes an earlier tile — an id
  // lookup stays correct no matter how many other tiles were removed first.
  id: number;
  letter: string;
}

interface State {
  filled: Record<string, string>;
  // Pre-revealed cells (level 1's first letter) that click_tile/clear_active
  // must never touch, even though they already look "filled".
  locked: Set<string>;
  bank: BankTile[];
  nextTileId: number;
  completed: Set<number>;
  activeWord: number | null;
  solved: boolean;
  // Bumped once per "word filled but wrong" event so a useEffect can call
  // onRetry exactly that many times (a plain boolean can't tell repeats apart).
  retrySignal: number;
}

type Action = { type: "select_cell"; key: string } | { type: "click_tile"; tileId: number } | { type: "clear_active" };

function createReducer(wordCells: string[][], cellToWords: Map<string, number[]>, words: CrosswordWordSlot[]) {
  return function reduce(state: State, action: Action): State {
    if (action.type === "select_cell") {
      if (state.solved) return state;
      const owners = cellToWords.get(action.key);
      if (!owners) return state;
      const selectable = owners.filter((i) => !state.completed.has(i));
      if (selectable.length === 0 || (state.activeWord !== null && selectable.includes(state.activeWord))) {
        return state;
      }
      return { ...state, activeWord: selectable[0] };
    }

    if (action.type === "click_tile") {
      const wordIndex = state.activeWord;
      if (state.solved || wordIndex === null || state.completed.has(wordIndex)) return state;
      const cells = wordCells[wordIndex];
      const nextCellKey = cells.find((key) => !(key in state.filled));
      const tile = state.bank.find((t) => t.id === action.tileId);
      if (!nextCellKey || !tile) return state;

      const filled = { ...state.filled, [nextCellKey]: tile.letter };
      const bank = state.bank.filter((t) => t.id !== action.tileId);
      if (!cells.every((key) => key in filled)) {
        return { ...state, filled, bank };
      }

      const assembled = cells.map((key) => filled[key]).join("");
      if (assembled !== words[wordIndex].answer) {
        return { ...state, filled, bank, retrySignal: state.retrySignal + 1 };
      }

      const completed = new Set(state.completed);
      completed.add(wordIndex);
      const solved = completed.size === words.length;
      const activeWord = solved ? null : words.findIndex((_, i) => !completed.has(i));
      return { ...state, filled, bank, completed, solved, activeWord };
    }

    // clear_active
    const wordIndex = state.activeWord;
    if (state.solved || wordIndex === null || state.completed.has(wordIndex)) return state;
    const filled = { ...state.filled };
    const returned: string[] = [];
    for (const key of wordCells[wordIndex]) {
      if (state.locked.has(key)) continue;
      const owners = cellToWords.get(key) ?? [];
      const heldByOtherCompletedWord = owners.some((i) => i !== wordIndex && state.completed.has(i));
      if (heldByOtherCompletedWord || !(key in filled)) continue;
      returned.push(filled[key]);
      delete filled[key];
    }
    if (returned.length === 0) return state;
    let nextTileId = state.nextTileId;
    const returnedTiles = returned.map((letter) => ({ id: nextTileId++, letter }));
    return { ...state, filled, bank: [...state.bank, ...returnedTiles], nextTileId };
  };
}

export default function CrosswordCaptcha({ problem, onSuccess, onRetry }: Props) {
  const { words, level } = problem;
  const revealFirstLetter = level === 1;
  const showChoseong = level <= 2;

  // Every distinct grid cell any word covers, plus which word index(es)
  // cover it, plus each word's cells in fill order — all derived once from
  // `words` so the puzzle data only has to describe the words themselves.
  const { wordCells, cellToWords, startCellNumber, correctLetters, firstAcrossKey, firstAcrossLetter } = useMemo(() => {
    const wordCells: string[][] = [];
    const cellToWords = new Map<string, number[]>();
    const startCellNumber = new Map<string, number>();
    const letterByCell = new Map<string, string>();
    let firstAcrossKey: string | null = null;
    let firstAcrossLetter = "";

    words.forEach((word, wordIndex) => {
      const cells: string[] = [];
      for (let i = 0; i < word.answer.length; i++) {
        const row = word.direction === "down" ? word.row + i : word.row;
        const col = word.direction === "across" ? word.col + i : word.col;
        const key = cellKey(row, col);
        cells.push(key);
        letterByCell.set(key, word.answer[i]);
        const owners = cellToWords.get(key) ?? [];
        owners.push(wordIndex);
        cellToWords.set(key, owners);
      }
      wordCells.push(cells);
      startCellNumber.set(cellKey(word.row, word.col), word.number);
      if (word.direction === "across" && word.number === 1) {
        firstAcrossKey = cells[0];
        firstAcrossLetter = word.answer[0];
      }
    });

    return {
      wordCells,
      cellToWords,
      startCellNumber,
      correctLetters: [...letterByCell.values()],
      firstAcrossKey,
      firstAcrossLetter,
    };
  }, [words]);

  const reducer = useMemo(() => createReducer(wordCells, cellToWords, words), [wordCells, cellToWords, words]);
  const [state, dispatch] = useReducer(reducer, null, () => {
    const letters = shuffle([...correctLetters, ...problem.decoys]);
    const filled: Record<string, string> = {};
    const locked = new Set<string>();
    if (revealFirstLetter && firstAcrossKey) {
      filled[firstAcrossKey] = firstAcrossLetter;
      locked.add(firstAcrossKey);
    }
    return {
      filled,
      locked,
      bank: letters.map((letter, id) => ({ id, letter })),
      nextTileId: letters.length,
      completed: new Set<number>(),
      activeWord: null,
      solved: false,
      retrySignal: 0,
    };
  });
  const { filled, locked, bank, completed, activeWord, solved, retrySignal } = state;

  useEffect(() => {
    if (!solved) return;
    const timer = setTimeout(onSuccess, 700);
    return () => clearTimeout(timer);
  }, [solved, onSuccess]);

  const lastRetrySignal = useRef(retrySignal);
  useEffect(() => {
    if (retrySignal !== lastRetrySignal.current) {
      lastRetrySignal.current = retrySignal;
      onRetry?.();
    }
  }, [retrySignal, onRetry]);

  const activeWordData = activeWord !== null ? words[activeWord] : null;
  const nextTargetKey = activeWord !== null ? wordCells[activeWord].find((key) => !(key in filled)) : undefined;

  return (
    <div className={`captcha-fade-in ${solved ? "captcha-pop-correct" : ""}`} style={{ textAlign: "center" }}>
      <p style={{ fontSize: 12.5, color: COLORS.subtext, marginBottom: 18 }}>
        {completed.size} / {words.length}개 완성했어요
      </p>

      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${problem.size}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${problem.size}, ${CELL_SIZE}px)`,
          gap: 4,
          marginBottom: 18,
        }}
      >
        {Array.from({ length: problem.size * problem.size }, (_, i) => {
          const row = Math.floor(i / problem.size);
          const col = i % problem.size;
          const key = cellKey(row, col);
          const owners = cellToWords.get(key);

          if (!owners) {
            return <div key={key} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
          }

          const isActive = activeWord !== null && owners.includes(activeWord);
          const isDone = owners.some((i) => completed.has(i));
          const isLocked = locked.has(key) && !isDone;
          const isNextTarget = isActive && key === nextTargetKey;
          const number = startCellNumber.get(key);

          const borderColor = isDone ? COLORS.done : isLocked ? COLORS.locked : isActive ? COLORS.active : COLORS.border;

          return (
            <button
              key={key}
              onClick={() => dispatch({ type: "select_cell", key })}
              style={{
                position: "relative",
                width: CELL_SIZE,
                height: CELL_SIZE,
                fontFamily: "inherit",
                fontSize: 18,
                fontWeight: 800,
                borderRadius: 8,
                border: `${isNextTarget ? 3 : 2}px solid ${borderColor}`,
                background: isDone ? COLORS.doneLight : isLocked ? COLORS.lockedLight : isActive ? COLORS.activeLight : "#fff",
                color: isDone ? COLORS.done : isLocked ? COLORS.locked : isActive ? COLORS.active : COLORS.text,
                cursor: isDone ? "default" : "pointer",
              }}
            >
              {number !== undefined && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    color: isActive || isLocked ? borderColor : COLORS.subtext,
                  }}
                >
                  {number}
                </span>
              )}
              {isLocked && (
                <span style={{ position: "absolute", top: 1, right: 3, fontSize: 8 }}>🔒</span>
              )}
              {filled[key] ?? ""}
            </button>
          );
        })}
      </div>

      {activeWordData && (
        <>
          <div
            style={{
              background: COLORS.activeLight,
              border: `2px solid ${COLORS.active}`,
              borderRadius: 16,
              padding: "12px 16px",
              marginBottom: 16,
              textAlign: "left",
              maxWidth: 360,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <p style={{ margin: "0 0 4px", fontSize: 12.5, fontWeight: 800, color: COLORS.active }}>
              {activeWordData.number}번 {activeWordData.direction === "across" ? "가로" : "세로"}
            </p>
            {showChoseong && (
              <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: COLORS.text, letterSpacing: 2 }}>
                {activeWordData.choseong}
              </p>
            )}
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLORS.text }}>{activeWordData.hint}</p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
              marginBottom: 18,
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {bank.map((tile) => (
              <button
                key={tile.id}
                onClick={() => dispatch({ type: "click_tile", tileId: tile.id })}
                style={{
                  fontFamily: "inherit",
                  fontSize: 17,
                  fontWeight: 800,
                  padding: "9px 15px",
                  borderRadius: 12,
                  border: `2px solid ${COLORS.border}`,
                  background: "#fff",
                  color: COLORS.text,
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(58,46,42,0.06)",
                }}
              >
                {tile.letter}
              </button>
            ))}
          </div>

          <button
            onClick={() => dispatch({ type: "clear_active" })}
            style={{
              fontFamily: "inherit",
              fontSize: 13.5,
              fontWeight: 800,
              padding: "9px 20px",
              borderRadius: 999,
              border: `2px solid ${COLORS.border}`,
              background: "#fff",
              color: COLORS.subtext,
              cursor: "pointer",
            }}
          >
            지우기
          </button>
        </>
      )}

      {solved && (
        <p style={{ marginTop: 18, fontSize: 14, fontWeight: 700, color: COLORS.done }}>정답이에요! 🎉</p>
      )}
    </div>
  );
}
