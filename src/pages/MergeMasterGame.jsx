import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";

import gameCoinImage from "../assets/images/avif/veloop-avif-assets/images/game_coin.avif";
import tokenImage from "../assets/images/avif/veloop-avif-assets/images/token-transparent.avif";

import styles from "./MergeMasterGame.module.css";

const SIZE = 4;
const GUIDE_STORAGE_KEY = "veloop_merge_master_guide_seen";
const BEST_SCORE_STORAGE_KEY = "veloop_merge_master_best_score";
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
    tokens,
    addGameCoins,
  } = useGame();

  const [board, setBoard] =
    useState(createBoard);

  const [score, setScore] =
    useState(0);

  const [bestScore, setBestScore] =
    useState(() => Number(localStorage.getItem(BEST_SCORE_STORAGE_KEY) || 0));

  const [history, setHistory] = useState([]);

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

  const [rewardStage, setRewardStage] = useState(null);
  const rewardTimerRef = useRef(null);

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

      setHistory((current) => [
        ...current.slice(-4),
        {
          board: board.map((row) => [...row]),
          score,
        },
      ]);

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

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
    }
  }, [score, bestScore]);

  useEffect(() => () => window.clearTimeout(rewardTimerRef.current), []);

  const startGuide = () => {
    localStorage.setItem(
      GUIDE_STORAGE_KEY,
      "true"
    );

    setShowGuide(false);
  };

  const undoMove = () => {
    if (result || showGuide || showStopModal || showHowToPlay || history.length === 0) {
      return;
    }

    const previous = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    setBoard(previous.board);
    setScore(previous.score);
  };

  const newGame = () => {
    setBoard(createBoard());
    setScore(0);
    setHistory([]);
    setResult(null);
    setReward(0);
    setRewardStage(null);
    setReviveUsed(false);
    rewardCollected.current = false;
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
    if (rewardCollected.current) {
      navigate("/games/merge-master");
      return;
    }

    rewardCollected.current = true;
    setRewardStage("celebrate");

    window.clearTimeout(rewardTimerRef.current);
    rewardTimerRef.current = window.setTimeout(() => {
      addGameCoins(reward);
      setRewardStage("flight");

      rewardTimerRef.current = window.setTimeout(() => {
        setRewardStage("summary");

        rewardTimerRef.current = window.setTimeout(() => {
          navigate("/games/merge-master");
        }, 1900);
      }, 1250);
    }, 1500);
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

        <div className={styles.balanceGroup} aria-label="Balances">
          <div className={styles.coinBalance}>
            <img src={tokenImage} alt="Tokens" className={styles.tokenIcon} />
            <span>{tokens}</span>
            <small>Tokens</small>
          </div>
          <div className={styles.coinBalance}>
            <img src={gameCoinImage} alt="Game Coins" className={styles.coinIcon} />
            <strong>{gameCoins}</strong>
            <small>Game Coins</small>
          </div>
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
          <span>BEST</span>

          <strong>{bestScore}</strong>
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
                    key={`${rowIndex}-${columnIndex}-${value}`}
                    className={styles.cell}
                    data-value={value}
                  >
                    {value || ""}
                  </div>
                )
              )
          )}
        </div>

        {/* GAME ACTIONS */}
        {!result && !showGuide && (
          <div className={styles.actionRow} aria-label="Game actions">
            <button
              type="button"
              className={styles.actionButton}
              onClick={undoMove}
              disabled={history.length === 0}
              aria-label="Undo last move"
            >
              ↶ <span>Undo</span>
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={newGame}
              aria-label="Start a new game"
            >
              ↻ <span>New Game</span>
            </button>
          </div>
        )}

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

            <p className={styles.modalIntro}>Combine matching tiles, grow your score, and build the 2048 tile.</p>

            <div className={styles.guideSteps}>
              <div className={styles.guideStep}><span className={styles.guideIcon}>↔</span><div><strong>Swipe to move</strong><span>Swipe the board or use the arrow keys.</span></div></div>
              <div className={styles.guideStep}><span className={styles.guideIcon}>2→4</span><div><strong>Merge matching tiles</strong><span>Equal numbers combine into one larger tile.</span></div></div>
              <div className={styles.guideStep}><span className={styles.guideIcon}>↗</span><div><strong>Build your score</strong><span>Every merge adds to your score.</span></div></div>
              <div className={styles.guideStep}><span className={styles.guideIcon}>2048</span><div><strong>Reach 2048 to win</strong><span>Create the 2048 tile before the board fills.</span></div></div>
            </div>

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

            <p className={styles.modalIntro}>
              Combine matching number tiles and build
              your highest possible score.
            </p>

            <div className={styles.guideSteps}>
              <div className={styles.guideStep}>
                <span className={styles.guideIcon} aria-hidden="true">↔</span>
                <div><strong>Move the board</strong><span>Swipe or use the arrow keys.</span></div>
              </div>
              <div className={styles.guideStep}>
                <span className={styles.guideIcon} aria-hidden="true">2→4</span>
                <div><strong>Merge matching tiles</strong><span>Equal numbers combine into one larger tile.</span></div>
              </div>
              <div className={styles.guideStep}>
                <span className={styles.guideIcon} aria-hidden="true">↗</span>
                <div><strong>Build your score</strong><span>Every successful merge increases your score.</span></div>
              </div>
              <div className={styles.guideStep}>
                <span className={styles.guideIcon} aria-hidden="true">🏆</span>
                <div><strong>Reach 2048</strong><span>Create the 2048 tile to win.</span></div>
              </div>
            </div>

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
            {!rewardStage && (
              <>
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

              </>
            )}

            {rewardStage ? (
              <div className={styles.rewardFlow} aria-live="polite">
                {rewardStage === "celebrate" && (
                  <>
                    <div className={styles.trophyWrap} aria-hidden="true">
                      <span className={styles.trophyGlow}>✦</span>
                      <span className={styles.trophy}>🏆</span>
                      <span className={styles.trophySpark}>✦</span>
                    </div>
                    <span className={styles.rewardKicker}>CONGRATULATIONS!</span>
                    <h3 className={styles.rewardTitle}>You Earned</h3>
                    <div className={styles.rewardAmount}>
                      <img src={gameCoinImage} alt="" className={styles.rewardCoinLarge} />
                      +{reward} Game Coins
                    </div>
                    <p className={styles.rewardMessage}>Great game! Your reward is ready.</p>
                  </>
                )}

                {rewardStage === "flight" && (
                  <>
                    <div className={styles.coinFlightScene} aria-hidden="true">
                      <div className={styles.coinSource}>
                        <img src={gameCoinImage} alt="" />
                      </div>
                      {Array.from({ length: 9 }).map((_, index) => (
                        <img
                          key={`merge-flight-${index}`}
                          src={gameCoinImage}
                          alt=""
                          className={styles.flyingCoin}
                          style={{ "--i": index, "--dx": `${(index - 4) * 24}px`, "--delay": `${index * 70}ms` }}
                        />
                      ))}
                      <div className={styles.coinTarget}>
                        <img src={gameCoinImage} alt="" />
                        <strong>{gameCoins}</strong>
                      </div>
                    </div>
                    <h3 className={styles.rewardTitle}>Coins Flying to Balance</h3>
                    <p className={styles.rewardMessage}>Your Game Coins are being added.</p>
                  </>
                )}

                {rewardStage === "summary" && (
                  <>
                    <div className={styles.summaryCheck} aria-hidden="true">✓</div>
                    <span className={styles.rewardKicker}>REWARD COLLECTED</span>
                    <h3 className={styles.rewardTitle}>Awesome!</h3>
                    <p className={styles.rewardMessage}>{reward} Game Coins have been added to your balance.</p>
                    <div className={styles.newBalance}>
                      <img src={gameCoinImage} alt="" className={styles.rewardCoin} />
                      <strong>{gameCoins}</strong>
                      <span>+{reward}</span>
                    </div>
                    <div className={styles.rewardProgress}><span /></div>
                  </>
                )}
              </div>
            ) : (
              <>
                <p>Final Score</p>
                <strong className={styles.finalScore}>{score}</strong>
                <div className={styles.rewardCelebration} aria-live="polite">
                  <p className={styles.reward}>
                    <img src={gameCoinImage} alt="" className={styles.coinIcon} />
                    +{reward} Game Coins
                  </p>
                </div>

                {result === "loss" && !reviveUsed && (
                  <button type="button" className={styles.primaryButton} onClick={revive}>❤️ Revive</button>
                )}

                <button type="button" className={styles.secondaryButton} onClick={collectReward}>
                  {result === "win" ? "Collect Reward" : "No Thanks"}
                </button>
              </>
            )}

            {rewardStage === "summary" && (
              <button type="button" className={styles.primaryButton} onClick={() => navigate("/games/merge-master")}>Continue</button>
            )}
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