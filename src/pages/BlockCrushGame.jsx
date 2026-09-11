/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";

import gameCoinImage from "../assets/images/avif/veloop-avif-assets/images/game_coin.avif";
import tokenImage from "../assets/images/avif/veloop-avif-assets/images/token-transparent.avif";

import styles from "./BlockCrushGame.module.css";

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 560;

const PADDLE_WIDTH = 90;
const PADDLE_HEIGHT = 12;

const BALL_SIZE = 10;

const BLOCK_ROWS = 5;
const BLOCK_COLUMNS = 6;

const BLOCK_WIDTH = 48;
const BLOCK_HEIGHT = 20;
const BLOCK_GAP = 8;

const INITIAL_LIVES = 3;

const GUIDE_STORAGE_KEY =
  "veloop_block_crush_guide_seen";

function createBlocks() {
  const blocks = [];

  for (
    let row = 0;
    row < BLOCK_ROWS;
    row += 1
  ) {
    for (
      let column = 0;
      column < BLOCK_COLUMNS;
      column += 1
    ) {
      blocks.push({
        x:
          12 +
          column *
            (BLOCK_WIDTH + BLOCK_GAP),

        y:
          50 +
          row *
            (BLOCK_HEIGHT + BLOCK_GAP),

        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        active: true,
      });
    }
  }

  return blocks;
}

function createInitialGameState() {
  return {
    paddleX:
      (CANVAS_WIDTH - PADDLE_WIDTH) / 2,

    ballX:
      CANVAS_WIDTH / 2 -
      BALL_SIZE / 2,

    ballY:
      CANVAS_HEIGHT - 70,

    ballSpeedX:
      Math.random() > 0.5 ? 3 : -3,

    ballSpeedY: -3,

    blocks: createBlocks(),

    score: 0,

    lives: INITIAL_LIVES,

    gameOver: false,

    paused: false,

    rewardCollected: false,
  };
}

function BlockCrushGame() {
  const navigate = useNavigate();

  const {
    gameCoins,
    tokens,
    addGameCoins,
  } = useGame();

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const gameStateRef = useRef(
    createInitialGameState()
  );

  const [
    score,
    setScore,
  ] = useState(0);

  const [
    lives,
    setLives,
  ] = useState(INITIAL_LIVES);

  const [
    gameOver,
    setGameOver,
  ] = useState(false);

  const [
    paused,
    setPaused,
  ] = useState(false);

  const [
    reviveUsed,
    setReviveUsed,
  ] = useState(false);

  const [
    reward,
    setReward,
  ] = useState(0);

  const [
    showGuide,
    setShowGuide,
  ] = useState(
    () =>
      localStorage.getItem(
        GUIDE_STORAGE_KEY
      ) !== "true"
  );

  const [
    showHowToPlay,
    setShowHowToPlay,
  ] = useState(false);

  const [
    showStopModal,
    setShowStopModal,
  ] = useState(false);

  const [rewardStage, setRewardStage] = useState(null);
  const rewardTimerRef = useRef(null);

  const calculateReward = (
    currentScore
  ) => {
    return Math.max(
      10,
      Math.floor(
        currentScore / 5
      )
    );
  };

  const resetBall = () => {
    const game =
      gameStateRef.current;

    game.ballX =
      CANVAS_WIDTH / 2 -
      BALL_SIZE / 2;

    game.ballY =
      CANVAS_HEIGHT - 70;

    game.ballSpeedX =
      Math.random() > 0.5
        ? 3
        : -3;

    game.ballSpeedY = -3;
  };

  const finishGame = () => {
    const game =
      gameStateRef.current;

    if (game.gameOver) {
      return;
    }

    game.gameOver = true;
    game.paused = false;

    const calculatedReward =
      calculateReward(
        game.score
      );

    setReward(
      calculatedReward
    );

    setGameOver(true);
    setPaused(false);

    cancelAnimationFrame(
      animationRef.current
    );
  };

  const pauseGame = () => {
    const game =
      gameStateRef.current;

    if (game.gameOver) {
      return;
    }

    game.paused = true;

    setPaused(true);

    cancelAnimationFrame(
      animationRef.current
    );
  };

  const resumeGame = () => {
    const game =
      gameStateRef.current;

    if (game.gameOver) {
      return;
    }

    game.paused = false;

    setPaused(false);

    cancelAnimationFrame(
      animationRef.current
    );

    animationRef.current =
      requestAnimationFrame(
        gameLoop
      );
  };

  const reviveGame = () => {
    const game =
      gameStateRef.current;

    if (
      gameOver === false ||
      reviveUsed
    ) {
      return;
    }

    game.lives = 1;
    game.gameOver = false;
    game.paused = false;

    setLives(1);
    setReviveUsed(true);
    setGameOver(false);
    setPaused(false);

    resetBall();

    cancelAnimationFrame(
      animationRef.current
    );

    animationRef.current =
      requestAnimationFrame(
        gameLoop
      );
  };

  const collectRewardAndGoHome = () => {
    const game = gameStateRef.current;

    if (game.rewardCollected) {
      navigate("/games/block-crush");
      return;
    }

    game.rewardCollected = true;
    setRewardStage("celebrate");

    window.clearTimeout(rewardTimerRef.current);
    rewardTimerRef.current = window.setTimeout(() => {
      addGameCoins(reward);
      setRewardStage("flight");

      rewardTimerRef.current = window.setTimeout(() => {
        setRewardStage("summary");

        rewardTimerRef.current = window.setTimeout(() => {
          navigate("/games/block-crush");
        }, 1900);
      }, 1250);
    }, 1500);
  };

  /*
   * Leaving an unfinished game
   * must NOT award Game Coins.
   */
  const exitWithoutReward = () => {
    const game =
      gameStateRef.current;

    game.gameOver = true;
    game.paused = true;

    cancelAnimationFrame(
      animationRef.current
    );

    setShowStopModal(false);

    navigate(
      "/games/block-crush"
    );
  };

  const movePaddle = (
    clientX
  ) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const scaleX =
      CANVAS_WIDTH /
      rect.width;

    const mouseX =
      (clientX - rect.left) *
      scaleX;

    let paddleX =
      mouseX -
      PADDLE_WIDTH / 2;

    paddleX = Math.max(
      0,
      Math.min(
        paddleX,
        CANVAS_WIDTH -
          PADDLE_WIDTH
      )
    );

    gameStateRef.current.paddleX =
      paddleX;
  };

  const handleMouseMove = (
    event
  ) => {
    const game =
      gameStateRef.current;

    if (
      game.gameOver ||
      game.paused ||
      showStopModal ||
      showHowToPlay
    ) {
      return;
    }

    movePaddle(
      event.clientX
    );
  };

  const handleTouchMove = (
    event
  ) => {
    const game =
      gameStateRef.current;

    if (
      game.gameOver ||
      game.paused ||
      showStopModal ||
      showHowToPlay
    ) {
      return;
    }

    const touch =
      event.touches[0];

    if (!touch) {
      return;
    }

    movePaddle(
      touch.clientX
    );
  };

  const handleKeyDown = (
    event
  ) => {
    const game =
      gameStateRef.current;

    if (
      showGuide ||
      showHowToPlay ||
      showStopModal
    ) {
      return;
    }

    if (
      event.key === "Escape"
    ) {
      if (
        game.gameOver
      ) {
        return;
      }

      if (game.paused) {
        resumeGame();
      } else {
        pauseGame();
      }

      return;
    }

    if (
      game.gameOver ||
      game.paused
    ) {
      return;
    }

    if (
      event.key ===
      "ArrowLeft"
    ) {
      event.preventDefault();

      game.paddleX = Math.max(
        0,
        game.paddleX - 25
      );
    }

    if (
      event.key ===
      "ArrowRight"
    ) {
      event.preventDefault();

      game.paddleX =
        Math.min(
          CANVAS_WIDTH -
            PADDLE_WIDTH,
          game.paddleX + 25
        );
    }
  };

  const drawGame = (
    ctx
  ) => {
    const game =
      gameStateRef.current;

    ctx.clearRect(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    /* Background */

    ctx.fillStyle =
      "#f7f8fc";

    ctx.fillRect(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    /* Border */

    ctx.strokeStyle =
      "#d9dce6";

    ctx.lineWidth = 2;

    ctx.strokeRect(
      1,
      1,
      CANVAS_WIDTH - 2,
      CANVAS_HEIGHT - 2
    );

    /* Blocks */

    game.blocks.forEach(
      (
        block,
        index
      ) => {
        if (!block.active) {
          return;
        }

        const row =
          Math.floor(
            index /
              BLOCK_COLUMNS
          );

        const colors = [
          "#6d5dfc",
          "#7567ee",
          "#8275df",
          "#9184d8",
          "#9d91d5",
        ];

        ctx.fillStyle =
          colors[row];

        ctx.beginPath();

        ctx.roundRect(
          block.x,
          block.y,
          block.width,
          block.height,
          6
        );

        ctx.fill();
      }
    );

    /* Paddle */

    // Keep the paddle clearly visible against the light game canvas.
    ctx.fillStyle =
      "#5b4bc4";
    ctx.strokeStyle =
      "#40358f";
    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.roundRect(
      game.paddleX,
      CANVAS_HEIGHT - 30,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      6
    );

    ctx.fill();
    ctx.stroke();

    /* Ball */

    ctx.beginPath();

    ctx.arc(
      game.ballX +
        BALL_SIZE / 2,
      game.ballY +
        BALL_SIZE / 2,
      BALL_SIZE / 2,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#f5a623";

    ctx.fill();

    ctx.closePath();
  };

  const updateGame = () => {
    const game =
      gameStateRef.current;

    if (
      game.gameOver ||
      game.paused
    ) {
      return;
    }

    game.ballX +=
      game.ballSpeedX;

    game.ballY +=
      game.ballSpeedY;

    /* Wall collision */

    if (
      game.ballX <= 0 ||
      game.ballX +
        BALL_SIZE >=
        CANVAS_WIDTH
    ) {
      game.ballX = Math.max(
        0,
        Math.min(
          game.ballX,
          CANVAS_WIDTH -
            BALL_SIZE
        )
      );

      game.ballSpeedX *= -1;
    }

    if (
      game.ballY <= 0
    ) {
      game.ballY = 0;
      game.ballSpeedY *= -1;
    }

    /* Paddle collision */

    const paddleY =
      CANVAS_HEIGHT - 30;

    if (
      game.ballY +
        BALL_SIZE >=
        paddleY &&
      game.ballY <=
        paddleY +
          PADDLE_HEIGHT &&
      game.ballX +
        BALL_SIZE >=
        game.paddleX &&
      game.ballX <=
        game.paddleX +
          PADDLE_WIDTH &&
      game.ballSpeedY > 0
    ) {
      game.ballY =
        paddleY -
        BALL_SIZE;

      game.ballSpeedY *= -1;

      const paddleCenter =
        game.paddleX +
        PADDLE_WIDTH / 2;

      const ballCenter =
        game.ballX +
        BALL_SIZE / 2;

      const difference =
        ballCenter -
        paddleCenter;

      const horizontalSpeed =
        Math.max(
          1.8,
          Math.min(
            4.5,
            Math.abs(
              difference
            ) * 0.08
          )
        );

      game.ballSpeedX =
        difference >= 0
          ? horizontalSpeed
          : -horizontalSpeed;
    }

    /* Block collision */

    for (
      const block of game.blocks
    ) {
      if (!block.active) {
        continue;
      }

      const collision =
        game.ballX <
          block.x +
            block.width &&
        game.ballX +
          BALL_SIZE >
          block.x &&
        game.ballY <
          block.y +
            block.height &&
        game.ballY +
          BALL_SIZE >
          block.y;

      if (collision) {
        block.active = false;

        game.ballY =
          block.y +
          block.height;

        game.ballSpeedY *= -1;

        game.score += 10;

        setScore(
          game.score
        );

        break;
      }
    }

    /* Win */

    const remainingBlocks =
      game.blocks.some(
        (block) =>
          block.active
      );

    if (
      !remainingBlocks
    ) {
      finishGame();

      return;
    }

    /* Lose life */

    if (
      game.ballY >
      CANVAS_HEIGHT
    ) {
      game.lives -= 1;

      setLives(
        Math.max(
          0,
          game.lives
        )
      );

      if (
        game.lives <= 0
      ) {
        finishGame();

        return;
      }

      resetBall();
    }
  };

  const gameLoop = () => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const game =
      gameStateRef.current;

    if (
      game.gameOver ||
      game.paused
    ) {
      return;
    }

    const ctx =
      canvas.getContext(
        "2d"
      );

    updateGame();

    drawGame(ctx);

    if (
      !game.gameOver &&
      !game.paused
    ) {
      animationRef.current =
        requestAnimationFrame(
          gameLoop
        );
    }
  };

  useEffect(() => {
    if (showGuide) {
      return;
    }

    const game =
      gameStateRef.current;

    game.gameOver = false;
    game.paused = false;

    cancelAnimationFrame(
      animationRef.current
    );

    animationRef.current =
      requestAnimationFrame(
        gameLoop
      );

    return () => {
      cancelAnimationFrame(
        animationRef.current
      );
    };
  }, [showGuide]);

  useEffect(() => {
    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    const canvas =
      canvasRef.current;

    if (canvas) {
      const ctx =
        canvas.getContext(
          "2d"
        );

      drawGame(ctx);
    }

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      cancelAnimationFrame(
        animationRef.current
      );
    };
  }, []);

  const startFromGuide = () => {
    localStorage.setItem(
      GUIDE_STORAGE_KEY,
      "true"
    );

    setShowGuide(false);
  };

  useEffect(() => () => window.clearTimeout(rewardTimerRef.current), []);

  return (
    <main
      className={styles.page}
    >
      {/* HEADER */}

      <header
        className={styles.header}
      >
        <button
          type="button"
          className={
            styles.backButton
          }
          onClick={() =>
            navigate(
              "/games/block-crush"
            )
          }
          aria-label="Back to Block Crush home"
        >
          ←
        </button>

        <div
          className={
            styles.gameTitle
          }
        >
          <span
            className={
              styles.gameLabel
            }
          >
            VELOOP GAME
          </span>

          <h1>
            Block Crush
          </h1>
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

      <section
        className={styles.hud}
      >
        <div
          className={
            styles.hudCard
          }
        >
          <span>SCORE</span>

          <strong>
            {score}
          </strong>
        </div>

        <div
          className={
            styles.hudCard
          }
        >
          <span>LIVES</span>

          <strong>
            {Math.max(
              0,
              lives
            )}{" "}
            / 3 ❤️
          </strong>
        </div>
      </section>

      {/* GAME AREA */}

      <section
        className={
          styles.gameArea
        }
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={
            styles.canvas
          }
          onMouseMove={
            handleMouseMove
          }
          onTouchMove={
            handleTouchMove
          }
          aria-label="Block Crush gameplay"
        />

        {/* FIRST-TIME GUIDE */}

        {showGuide && (
          <div
            className={
              styles.overlay
            }
          >
            <div
              className={
                styles.modal
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby="block-guide-title"
            >
              <span
                className={
                  styles.modalLabel
                }
              >
                BLOCK CRUSH
              </span>

              <h2 id="block-guide-title">
                How to Play
              </h2>

              <p className={styles.modalIntro}>Keep the ball in play, break the blocks, and beat your high score.</p>

              <div className={styles.guideSteps}>
                <div className={styles.guideStep}><span className={styles.guideIcon}>↔</span><div><strong>Move the paddle</strong><span>Drag on mobile, move your mouse, or use ← →.</span></div></div>
                <div className={styles.guideStep}><span className={styles.guideIcon}>●</span><div><strong>Keep the ball alive</strong><span>Catch every bounce with the paddle.</span></div></div>
                <div className={styles.guideStep}><span className={styles.guideIcon}>▦</span><div><strong>Crush the blocks</strong><span>Each broken block adds points to your score.</span></div></div>
                <div className={styles.guideStep}><span className={styles.guideIcon}>♥</span><div><strong>Protect your 3 lives</strong><span>Clear the board before you run out of lives.</span></div></div>
              </div>

              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={
                  startFromGuide
                }
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* HOW TO PLAY */}

        {showHowToPlay && (
          <div
            className={
              styles.overlay
            }
          >
            <div
              className={
                styles.modal
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby="block-how-title"
            >
              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={() =>
                  setShowHowToPlay(
                    false
                  )
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
                BLOCK CRUSH
              </span>

              <h2 id="block-how-title">
                How to Play
              </h2>

              <p>
                Keep your paddle under
                the ball and destroy
                every block.
              </p>

              <ul>
                <li>
                  Mouse: move
                  horizontally.
                </li>

                <li>
                  Touch: drag your
                  finger.
                </li>

                <li>
                  Keyboard: use
                  ← and →.
                </li>

                <li>
                  You have 3 lives.
                </li>

                <li>
                  Clear every block
                  to win.
                </li>
              </ul>

              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={() =>
                  setShowHowToPlay(
                    false
                  )
                }
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* PAUSE */}

        {paused && (
          <div
            className={
              styles.overlay
            }
          >
            <div
              className={
                styles.modal
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby="pause-title"
            >
              <span
                className={
                  styles.modalLabel
                }
              >
                GAME PAUSED
              </span>

              <h2 id="pause-title">
                Take a Break
              </h2>

              <p>
                Your current game
                session is paused.
              </p>

              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={
                  resumeGame
                }
              >
                Resume Game
              </button>

              <button
                type="button"
                className={
                  styles.secondaryButton
                }
                onClick={() =>
                  setShowStopModal(
                    true
                  )
                }
              >
                Exit Game
              </button>
            </div>
          </div>
        )}

        {/* RESULT */}

        {gameOver && (
          <div
            className={
              styles.overlay
            }
          >
            <div
              className={
                styles.modal
              }
              role="dialog"
              aria-modal="true"
              aria-labelledby="block-result-title"
            >
              {!rewardStage && (
                <>
              <span
                className={
                  styles.modalLabel
                }
              >
                {lives > 0
                  ? "CHALLENGE COMPLETE"
                  : "GAME OVER"}
              </span>

              <h2 id="block-result-title">
                {lives > 0
                  ? "🏆 Blocks Cleared!"
                  : "No More Lives"}
              </h2>

              <p>
                Final Score
              </p>

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
                        <div className={styles.coinSource}><img src={gameCoinImage} alt="" /></div>
                        {Array.from({ length: 14 }).map((_, index) => (
                          <img key={`block-flight-${index}`} src={gameCoinImage} alt="" className={styles.flyingCoin} style={{
                            "--i": index,
                            "--dx": `${(index - 6.5) * 22}px`,
                            "--delay": `${index * 65}ms`
                          }} />
                        ))}
                        <div className={styles.coinTarget}><img src={gameCoinImage} alt="" /><strong>{gameCoins}</strong></div>
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

                  {!reviveUsed && lives <= 0 && (
                    <button type="button" className={styles.primaryButton} onClick={reviveGame}>❤️ Revive</button>
                  )}

                  <button type="button" className={styles.secondaryButton} onClick={collectRewardAndGoHome}>
                    {lives > 0 ? "Collect Reward" : "No Thanks"}
                  </button>
                </>
              )}

              {rewardStage === "summary" && (
                <button type="button" className={styles.primaryButton} onClick={() => navigate("/games/block-crush")}>Continue</button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* STOP CONFIRMATION */}

      {showStopModal && (
        <div
          className={
            styles.overlay
          }
        >
          <div
            className={
              styles.modal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-block-title"
          >
            <span
              className={
                styles.modalLabel
              }
            >
              EXIT GAME
            </span>

            <h2 id="exit-block-title">
              Leave this game?
            </h2>

            <p>
              Your current progress
              will be lost and no
              Game Coins will be
              awarded.
            </p>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={
                exitWithoutReward
              }
            >
              Exit Game
            </button>

            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={() => {
                setShowStopModal(
                  false
                );

                if (paused) {
                  setPaused(false);

                  gameStateRef.current.paused =
                    false;

                  animationRef.current =
                    requestAnimationFrame(
                      gameLoop
                    );
                }
              }}
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* HOW TO PLAY BUTTON */}

      {!gameOver &&
        !showGuide &&
        !paused && (
          <button
            type="button"
            className={
              styles.guideButton
            }
            onClick={() =>
              setShowHowToPlay(
                true
              )
            }
          >
            How to Play
          </button>
        )}

      {/* STOP BUTTON */}

      {!gameOver &&
        !showGuide &&
        !paused && (
          <button
            type="button"
            className={
              styles.stopButton
            }
            onClick={() => {
              pauseGame();
              setShowStopModal(
                true
              );
            }}
          >
            ⏸ Stop Game
          </button>
        )}

      {/* INSTRUCTION */}

      <p
        className={
          styles.instruction
        }
      >
        Move the paddle with your
        mouse, touch, or ← →
        keyboard arrows.
      </p>

      {/* BOTTOM NAV */}

      <nav
        className={
          styles.bottomNav
        }
        aria-label="Game navigation"
      >
        <button
          type="button"
          className={
            styles.navItem
          }
          onClick={() =>
            navigate(
              "/games/block-crush"
            )
          }
        >
          <span>⌂</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={
            styles.navItem
          }
          onClick={() =>
            navigate(
              "/redeem"
            )
          }
        >
          <span>◇</span>
          <span>Redeem</span>
        </button>
      </nav>
    </main>
  );
}

export default BlockCrushGame;
