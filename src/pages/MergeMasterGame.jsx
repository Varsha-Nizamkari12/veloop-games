import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";

import gameCoinImage from "../assets/images/game_coin.jpeg";

import styles from "./MergeMasterGame.module.css";

const SIZE = 4;
const GUIDE_STORAGE_KEY = "veloop_merge_master_guide_seen";
const MINIMUM_SWIPE_DISTANCE = 35;

function emptyBoard() {
  return Array.from(
    { length: SIZE },
    () => Array(SIZE).fill(0)
  );
}

function addRandomTile(board) {
  const empty = [];

  board.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (!value) {
        empty.push([rowIndex, columnIndex]);
      }
    });
  });

  if (empty.length === 0) {
    return board;
  }

  const [row, column] =
    empty[Math.floor(Math.random() * empty.length)];

  const nextBoard = board.map((row) => [...row]);

  nextBoard[row][column] =
    Math.random() < 0.9 ? 2 : 4;

  return nextBoard;
}

function createBoard() {
  let board = emptyBoard();

  board = addRandomTile(board);
  board = addRandomTile(board);

  return board;
}

function slide(row) {
  const values = row.filter(Boolean);
  const result = [];
  let score = 0;

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const mergedValue = values[index] * 2;

      result.push(mergedValue);
      score += mergedValue;

      index += 1;
    } else {
      result.push(values[index]);
    }
  }

  while (result.length < SIZE) {
    result.push(0);
  }

  return {
    row: result,
    score,
  };
}

function moveLeft(board) {
  let score = 0;

  const nextBoard = board.map((row) => {
    const result = slide(row);

    score += result.score;

    return result.row;
  });

  return {
    board: nextBoard,
    score,
  };
}

function reverse(board) {
  return board.map((row) => [...row].reverse());
}

function transpose(board) {
  return board[0].map((_, column) =>
    board.map((row) => row[column])
  );
}

function moveRight(board) {
  const result = moveLeft(reverse(board));

  return {
    board: reverse(result.board),
    score: result.score,
  };
}

function moveUp(board) {
  const result = moveLeft(transpose(board));

  return {
    board: transpose(result.board),
    score: result.score,
  };
}

function moveDown(board) {
  const result = moveRight(transpose(board));

  return {
    board: transpose(result.board),
    score: result.score,
  };
}

function boardsEqual(first, second) {
  return first.every((row, rowIndex) =>
    row.every(
      (value, columnIndex) =>
        value === second[rowIndex][columnIndex]
    )
  );
}

function hasValidMoves(board) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      if (board[row][column] === 0) {
        return true;
      }

      if (
        column < SIZE - 1 &&
        board[row][column] ===
          board[row][column + 1]
      ) {
        return true;
      }

      if (
        row < SIZE - 1 &&
        board[row][column] ===
          board[row + 1][column]
      ) {
        return true;
      }
    }
  }

  return false;
}

function hasWon(board) {
  return board.some((row) =>
    row.includes(2048)
  );
}

function MergeMasterGame() {
  const navigate = useNavigate();

  const {
    gameCoins,
    addGameCoins,
  } = useGame();

  const [board, setBoard] =
    useState(createBoard);

  const [score, setScore] =
    useState(0);

  const [result, setResult] =
    useState(null);

  const [reward, setReward] =
    useState(0);

  const [showGuide, setShowGuide] =
    useState(() =>
      localStorage.getItem(
        GUIDE_STORAGE_KEY
      ) !== "true"
    );

  const [showStopModal, setShowStopModal] =
    useState(false);

  const [showHowToPlay, setShowHowToPlay] =
    useState(false);

  const [reviveUsed, setReviveUsed] =
    useState(false);

  const touchStart = useRef(null);

  const rewardCollected =
    useRef(false);

  const calculateReward = (currentScore) => {
    return Math.max(
      10,
      Math.floor(currentScore / 20)
    );
  };

  const finishGame = useCallback(
    (outcome, finalScore) => {
      const calculatedReward =
        calculateReward(finalScore);

      setReward(calculatedReward);
      setResult(outcome);
    },
    []
  );

  const performMove = useCallback(
    (direction) => {
      if (
        result ||
        showGuide ||
        showStopModal ||
        showHowToPlay
      ) {
        return;
      }

      const moves = {
        left: moveLeft,
        right: moveRight,
        up: moveUp,
        down: moveDown,
      };

      const moveFunction =
        moves[direction];

      if (!moveFunction) {
        return;
      }

      const moved =
        moveFunction(board);

      if (
        boardsEqual(
          board,
          moved.board
        )
      ) {
        return;
      }

      const nextBoard =
        addRandomTile(
          moved.board
        );

      const nextScore =
        score + moved.score;

      setBoard(nextBoard);
      setScore(nextScore);

      if (hasWon(nextBoard)) {
        finishGame(
          "win",
          nextScore
        );

        return;
      }

      if (!hasValidMoves(nextBoard)) {
        finishGame(
          "loss",
          nextScore
        );
      }
    },
    [
      board,
      finishGame,
      result,
      score,
      showGuide,
      showHowToPlay,
      showStopModal,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        result ||
        showGuide ||
        showStopModal ||
        showHowToPlay
      ) {
        return;
      }

      const directionMap = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };

      const direction =
        directionMap[event.key];

      if (!direction) {
        return;
      }

      event.preventDefault();

      performMove(direction);
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    performMove,
    result,
    showGuide,
    showHowToPlay,
    showStopModal,
  ]);

  const startGuide = () => {
    localStorage.setItem(
      GUIDE_STORAGE_KEY,
      "true"
    );

    setShowGuide(false);
  };

  const revive = () => {
    if (
      result !== "loss" ||
      reviveUsed
    ) {
      return;
    }

    setReviveUsed(true);
    setResult(null);

    setBoard((currentBoard) =>
      addRandomTile(currentBoard)
    );
  };

  const collectReward = () => {
    if (
      !rewardCollected.current
    ) {
      rewardCollected.current = true;

      addGameCoins(reward);
    }

    navigate(
      "/games/merge-master"
    );
  };

  const handleExit = () => {
    setShowStopModal(false);

    navigate(
      "/games/merge-master"
    );
  };

  const handleTouchStart = (event) => {
    const touch =
      event.changedTouches[0];

    if (!touch) {
      return;
    }

    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = (event) => {
    if (!touchStart.current) {
      return;
    }

    const touch =
      event.changedTouches[0];

    if (!touch) {
      return;
    }

    const deltaX =
      touch.clientX -
      touchStart.current.x;

    const deltaY =
      touch.clientY -
      touchStart.current.y;

    touchStart.current = null;

    const horizontalDistance =
      Math.abs(deltaX);

    const verticalDistance =
      Math.abs(deltaY);

    if (
      Math.max(
        horizontalDistance,
        verticalDistance
      ) < MINIMUM_SWIPE_DISTANCE
    ) {
      return;
    }

    if (
      horizontalDistance >
      verticalDistance
    ) {
      performMove(
        deltaX > 0
          ? "right"
          : "left"
      );
    } else {
      performMove(
        deltaY > 0
          ? "down"
          : "up"
      );
    }
  };

  return (
    <main className={styles.page}>
      {/* HEADER */}

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() =>
            navigate(
              "/games/merge-master"
            )
          }
          aria-label="Back to Merge Master home"
        >
          ←
        </button>

        <div
          className={styles.titleBlock}
        >
          <span
            className={styles.eyebrow}
          >
            VELOOP GAME
          </span>

          <h1>Merge Master</h1>
        </div>

        <div
          className={styles.coinBalance}
        >
          <img
            src={gameCoinImage}
            alt=""
            className={styles.coinIcon}
          />

          <strong>
            {gameCoins}
          </strong>
        </div>
      </header>

      {/* HUD */}

      <section className={styles.hud}>
        <div
          className={styles.hudCard}
        >
          <span>SCORE</span>

          <strong>{score}</strong>
        </div>

        <div
          className={styles.hudCard}
        >
          <span>TARGET</span>

          <strong>2048</strong>
        </div>
      </section>

      {/* GAME */}

      <section
        className={styles.gameSection}
      >
        <div
          className={styles.board}
          onTouchStart={
            handleTouchStart
          }
          onTouchEnd={
            handleTouchEnd
          }
          aria-label="Merge Master game board"
          role="application"
        >
          {board.flatMap(
            (row, rowIndex) =>
              row.map(
                (
                  value,
                  columnIndex
                ) => (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className={styles.cell}
                    data-value={value}
                  >
                    {value || ""}
                  </div>
                )
              )
          )}
        </div>

        {/* CONTROLS */}

        <div
          className={styles.controls}
          aria-label="Game controls"
        >
          <button
            type="button"
            onClick={() =>
              performMove("up")
            }
            aria-label="Move up"
          >
            ↑
          </button>

          <div
            className={
              styles.horizontalControls
            }
          >
            <button
              type="button"
              onClick={() =>
                performMove("left")
              }
              aria-label="Move left"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() =>
                performMove("down")
              }
              aria-label="Move down"
            >
              ↓
            </button>

            <button
              type="button"
              onClick={() =>
                performMove("right")
              }
              aria-label="Move right"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* INSTRUCTIONS */}

      <p
        className={styles.instruction}
      >
        Swipe the board or use your
        arrow keys to merge matching
        tiles.
      </p>

      {/* HOW TO PLAY */}

      {!result &&
        !showGuide && (
          <button
            type="button"
            className={styles.guideButton}
            onClick={() =>
              setShowHowToPlay(true)
            }
          >
            How to Play
          </button>
        )}

      {/* STOP GAME */}

      {!result &&
        !showGuide && (
          <button
            type="button"
            className={styles.stopButton}
            onClick={() =>
              setShowStopModal(true)
            }
          >
            ⏸ Stop Game
          </button>
        )}

      {/* FIRST-TIME GUIDE */}

      {showGuide && (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="merge-guide-title"
          >
            <span
              className={
                styles.modalLabel
              }
            >
              MERGE MASTER
            </span>

            <h2 id="merge-guide-title">
              How to Play
            </h2>

            <p>
              Combine matching number
              tiles to create larger
              values.
            </p>

            <ul>
              <li>
                Swipe or use arrow keys.
              </li>

              <li>
                Matching tiles merge
                into one.
              </li>

              <li>
                Every merge increases
                your score.
              </li>

              <li>
                Reach 2048 to win.
              </li>
            </ul>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={startGuide}
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* HOW TO PLAY MODAL */}

      {showHowToPlay && (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="merge-how-title"
          >
            <button
              type="button"
              className={
                styles.closeButton
              }
              onClick={() =>
                setShowHowToPlay(false)
              }
              aria-label="Close How to Play"
            >
              ×
            </button>

            <span
              className={
                styles.modalLabel
              }
            >
              MERGE MASTER
            </span>

            <h2 id="merge-how-title">
              How to Play
            </h2>

            <p>
              Combine matching number
              tiles to create larger
              values.
            </p>

            <ul>
              <li>
                Swipe the board or use
                the arrow keys.
              </li>

              <li>
                Equal tiles merge into
                one larger tile.
              </li>

              <li>
                Each merge increases
                your score.
              </li>

              <li>
                Keep creating larger
                numbers.
              </li>

              <li>
                Reach 2048 to win.
              </li>
            </ul>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={() =>
                setShowHowToPlay(false)
              }
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* EXIT CONFIRMATION */}

      {showStopModal && (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-game-title"
          >
            <span
              className={
                styles.modalLabel
              }
            >
              EXIT GAME
            </span>

            <h2 id="exit-game-title">
              Leave this game?
            </h2>

            <p>
              Your current progress will
              be lost and no Game Coins
              will be awarded.
            </p>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={handleExit}
            >
              Exit Game
            </button>

            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={() =>
                setShowStopModal(false)
              }
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* RESULT */}

      {result && (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
          >
            {result === "win" ? (
              <>
                <span
                  className={
                    styles.modalLabel
                  }
                >
                  CHALLENGE COMPLETE
                </span>

                <h2 id="result-title">
                  🏆 You Won!
                </h2>

                <p>
                  You reached the 2048
                  tile.
                </p>
              </>
            ) : (
              <>
                <span
                  className={
                    styles.modalLabel
                  }
                >
                  GAME OVER
                </span>

                <h2 id="result-title">
                  No More Moves
                </h2>

                <p>
                  Your board has no
                  available moves.
                </p>
              </>
            )}

            <p>Final Score</p>

            <strong
              className={
                styles.finalScore
              }
            >
              {score}
            </strong>

            <p
              className={styles.reward}
            >
              <img
                src={gameCoinImage}
                alt=""
                className={styles.coinIcon}
              />

              {" "}+{reward} Game Coins
            </p>

            {/* REVIVE */}

            {result === "loss" &&
              !reviveUsed && (
                <button
                  type="button"
                  className={
                    styles.primaryButton
                  }
                  onClick={revive}
                >
                  ❤️ Revive
                </button>
              )}

            {/* COLLECT */}

            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={collectReward}
            >
              {result === "win"
                ? "Collect Reward"
                : "No Thanks"}
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}

      <nav
        className={styles.bottomNav}
        aria-label="Game navigation"
      >
        <button
          type="button"
          className={styles.navItem}
          onClick={() =>
            navigate(
              "/games/merge-master"
            )
          }
        >
          <span>⌂</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={() =>
            navigate("/redeem")
          }
        >
          <span>◇</span>
          <span>Redeem</span>
        </button>
      </nav>
    </main>
  );
}

export default MergeMasterGame;