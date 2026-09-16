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
const INITIAL_BALL_SPEED = 310;
const MAX_BALL_SPEED = 430;
const FRAME_TIME_CAP = 0.032;

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

  for (let row = 0; row < BLOCK_ROWS; row += 1) {
    for (
      let column = 0;
      column < BLOCK_COLUMNS;
      column += 1
    ) {
      blocks.push({
        x:
          12 +
          column * (BLOCK_WIDTH + BLOCK_GAP),

        y:
          50 +
          row * (BLOCK_HEIGHT + BLOCK_GAP),

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
      Math.random() > 0.5
        ? INITIAL_BALL_SPEED
        : -INITIAL_BALL_SPEED,

    ballSpeedY: -INITIAL_BALL_SPEED,

    trail: [],
    particles: [],
    combo: 0,
    hitFlash: 0,
    lastFrameTime: 0,

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

  const [score, setScore] = useState(0);

  const [lives, setLives] =
    useState(INITIAL_LIVES);

  const [gameOver, setGameOver] =
    useState(false);

  const [resultVisible, setResultVisible] =
    useState(false);

  const [paused, setPaused] =
    useState(false);

  const [reviveUsed, setReviveUsed] =
    useState(false);

  const [reward, setReward] =
    useState(0);

  const [showGuide, setShowGuide] =
    useState(
      () =>
        localStorage.getItem(
          GUIDE_STORAGE_KEY
        ) !== "true"
    );

  const [showHowToPlay, setShowHowToPlay] =
    useState(false);

  const [showStopModal, setShowStopModal] =
    useState(false);

  const [rewardStage, setRewardStage] =
    useState(null);

  const rewardTimerRef = useRef(null);

  const calculateReward = (
    currentScore
  ) => {
    return Math.max(
      10,
      Math.floor(currentScore / 5)
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
        ? INITIAL_BALL_SPEED
        : -INITIAL_BALL_SPEED;

    game.ballSpeedY =
      -INITIAL_BALL_SPEED;

    game.lastFrameTime = 0;
    game.trail = [];
  };

  const finishGame = () => {
    const game =
      gameStateRef.current;

    if (game.gameOver) {
      return;
    }

    game.gameOver = true;
    game.paused = false;
    game.lastFrameTime = 0;

    const calculatedReward =
      calculateReward(game.score);

    setScore(game.score);
    setLives(Math.max(0, game.lives));
    setReward(calculatedReward);
    setPaused(false);
    setGameOver(true);
    setResultVisible(true);

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }
  };

  const pauseGame = () => {
    const game =
      gameStateRef.current;

    if (game.gameOver) {
      return;
    }

    game.paused = true;
    game.lastFrameTime = 0;

    setPaused(true);

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }
  };

  const resumeGame = () => {
    const game =
      gameStateRef.current;

    if (game.gameOver) {
      return;
    }

    game.paused = false;
    game.lastFrameTime = 0;

    setPaused(false);

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    animationRef.current =
      requestAnimationFrame(
        gameLoop
      );
  };

  /*
   * HOW TO PLAY
   *
   * Opening this modal explicitly pauses the
   * game so the ball cannot continue moving
   * behind the instructions.
   */
  const openHowToPlay = () => {
    const game =
      gameStateRef.current;

    if (
      game.gameOver ||
      showGuide ||
      showStopModal
    ) {
      return;
    }

    game.paused = true;
    game.lastFrameTime = 0;

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    setPaused(false);
    setShowHowToPlay(true);
  };

  /*
   * Close How To Play and immediately
   * continue the game.
   */
  const closeHowToPlay = () => {
    const game =
      gameStateRef.current;

    setShowHowToPlay(false);

    if (
      game.gameOver ||
      showStopModal
    ) {
      return;
    }

    game.paused = false;
    game.lastFrameTime = 0;

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

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
    setResultVisible(false);

    resetBall();

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    animationRef.current =
      requestAnimationFrame(
        gameLoop
      );
  };

  const collectRewardAndGoHome = () => {
    const game =
      gameStateRef.current;

    if (game.rewardCollected) {
      navigate(
        "/games/block-crush"
      );
      return;
    }

    game.rewardCollected = true;

    setRewardStage(
      "celebrate"
    );

    window.clearTimeout(
      rewardTimerRef.current
    );

    rewardTimerRef.current =
      window.setTimeout(() => {
        addGameCoins(reward);

        setRewardStage(
          "flight"
        );

        rewardTimerRef.current =
          window.setTimeout(() => {
            setRewardStage(
              "summary"
            );

            rewardTimerRef.current =
              window.setTimeout(() => {
                navigate(
                  "/games/block-crush"
                );
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

    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    setShowStopModal(false);

    navigate(
      "/games/block-crush"
    );
  };

  /*
   * Convert pointer position from screen
   * coordinates into the 360px canvas coordinate
   * system.
   */
  const movePaddle = (
    clientX
  ) => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const game =
      gameStateRef.current;

    if (
      game.gameOver ||
      game.paused ||
      showGuide ||
      showStopModal ||
      showHowToPlay
    ) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    if (
      rect.width <= 0
    ) {
      return;
    }

    const scaleX =
      CANVAS_WIDTH /
      rect.width;

    const canvasX =
      (clientX - rect.left) *
      scaleX;

    const nextPaddleX =
      canvasX -
      PADDLE_WIDTH / 2;

    game.paddleX =
      Math.max(
        0,
        Math.min(
          CANVAS_WIDTH -
            PADDLE_WIDTH,
          nextPaddleX
        )
      );
  };

  /*
   * Pointer Events handle:
   * - mouse
   * - touch
   * - pen
   *
   * This is more reliable than having
   * separate mouse/touch listeners.
   */
  const handlePointerMove = (
    event
  ) => {
    if (
      event.pointerType !==
        "mouse" &&
      event.pointerType !==
        "touch" &&
      event.pointerType !==
        "pen"
    ) {
      return;
    }

    movePaddle(
      event.clientX
    );
  };

  /*
   * Pointer capture keeps receiving movement
   * even when the finger/mouse temporarily
   * moves outside the canvas.
   */
  const handlePointerDown = (
    event
  ) => {
    if (
      event.pointerType ===
        "touch" ||
      event.pointerType ===
        "pen"
    ) {
      try {
        event.currentTarget.setPointerCapture(
          event.pointerId
        );
      } catch {
        // Ignore unsupported pointer capture.
      }
    }

    movePaddle(
      event.clientX
    );
  };

  const handlePointerUp = (
    event
  ) => {
    try {
      if (
        event.currentTarget.hasPointerCapture(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      }
    } catch {
      // Ignore unsupported pointer capture.
    }
  };

  const handleKeyDown = (
    event
  ) => {
    const game =
      gameStateRef.current;

    /*
     * Escape closes How To Play first.
     */
    if (
      showHowToPlay
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        event.preventDefault();
        closeHowToPlay();
      }

      return;
    }

    if (
      showGuide ||
      showStopModal
    ) {
      return;
    }

    if (
      event.key ===
      "Escape"
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

      game.paddleX =
        Math.max(
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

    /* Premium arcade background */
    const background =
      ctx.createLinearGradient(
        0,
        0,
        0,
        CANVAS_HEIGHT
      );

    background.addColorStop(
      0,
      "#0d1020"
    );

    background.addColorStop(
      0.52,
      "#151a31"
    );

    background.addColorStop(
      1,
      "#090b17"
    );

    ctx.fillStyle =
      background;

    ctx.fillRect(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    /* Subtle grid */
    ctx.save();

    ctx.strokeStyle =
      "rgba(151, 139, 255, .055)";

    ctx.lineWidth = 1;

    for (
      let x = 0;
      x <= CANVAS_WIDTH;
      x += 30
    ) {
      ctx.beginPath();
      ctx.moveTo(
        x,
        0
      );
      ctx.lineTo(
        x,
        CANVAS_HEIGHT
      );
      ctx.stroke();
    }

    for (
      let y = 0;
      y <= CANVAS_HEIGHT;
      y += 30
    ) {
      ctx.beginPath();
      ctx.moveTo(
        0,
        y
      );
      ctx.lineTo(
        CANVAS_WIDTH,
        y
      );
      ctx.stroke();
    }

    ctx.restore();

    /* Soft arena glow */
    const arenaGlow =
      ctx.createRadialGradient(
        CANVAS_WIDTH / 2,
        150,
        30,
        CANVAS_WIDTH / 2,
        150,
        300
      );

    arenaGlow.addColorStop(
      0,
      "rgba(111, 91, 255, .14)"
    );

    arenaGlow.addColorStop(
      1,
      "rgba(111, 91, 255, 0)"
    );

    ctx.fillStyle =
      arenaGlow;

    ctx.fillRect(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    /* Blocks */
    game.blocks.forEach(
      (block, index) => {
        if (!block.active) {
          return;
        }

        const row =
          Math.floor(
            index /
              BLOCK_COLUMNS
          );

        const palette = [
          ["#9a8cff", "#6256e8"],
          ["#8b83ff", "#5148ce"],
          ["#73a7ff", "#4b6ee8"],
          ["#57c6ee", "#3d84d9"],
          ["#5dd6b1", "#2c9c83"],
        ];

        const [
          top,
          bottom,
        ] = palette[row];

        const gradient =
          ctx.createLinearGradient(
            block.x,
            block.y,
            block.x,
            block.y +
              block.height
          );

        gradient.addColorStop(
          0,
          top
        );

        gradient.addColorStop(
          1,
          bottom
        );

        ctx.save();

        ctx.shadowColor =
          "rgba(100, 91, 255, .22)";

        ctx.shadowBlur = 9;

        ctx.fillStyle =
          gradient;

        ctx.beginPath();

        ctx.roundRect(
          block.x,
          block.y,
          block.width,
          block.height,
          7
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle =
          "rgba(255,255,255,.18)";

        ctx.beginPath();

        ctx.roundRect(
          block.x + 2,
          block.y + 2,
          block.width - 4,
          4,
          3
        );

        ctx.fill();

        ctx.restore();
      }
    );

    /* Progress rail */
    const destroyed =
      game.blocks.filter(
        (block) =>
          !block.active
      ).length;

    const progress =
      destroyed /
      game.blocks.length;

    ctx.fillStyle =
      "rgba(255,255,255,.09)";

    ctx.beginPath();

    ctx.roundRect(
      12,
      CANVAS_HEIGHT - 12,
      CANVAS_WIDTH - 24,
      3,
      2
    );

    ctx.fill();

    ctx.fillStyle =
      "#7c70ff";

    ctx.beginPath();

    ctx.roundRect(
      12,
      CANVAS_HEIGHT - 12,
      (CANVAS_WIDTH - 24) *
        progress,
      3,
      2
    );

    ctx.fill();

    /* Ball trail */
    game.trail.forEach(
      (point, index) => {
        const alpha =
          (index + 1) /
          game.trail.length;

        ctx.beginPath();

        ctx.arc(
          point.x,
          point.y,
          Math.max(
            1.5,
            (index + 1) *
              0.55
          ),
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `rgba(255, 219, 103, ${
            alpha * 0.24
          })`;

        ctx.fill();
      }
    );

    /* Particles */
    game.particles.forEach(
      (particle) => {
        ctx.globalAlpha =
          Math.max(
            0,
            particle.life
          );

        ctx.fillStyle =
          particle.color;

        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    );

    ctx.globalAlpha = 1;

    /* Paddle */
    const paddleGradient =
      ctx.createLinearGradient(
        game.paddleX,
        CANVAS_HEIGHT - 30,
        game.paddleX,
        CANVAS_HEIGHT - 18
      );

    paddleGradient.addColorStop(
      0,
      "#a59aff"
    );

    paddleGradient.addColorStop(
      1,
      "#5b4de0"
    );

    ctx.save();

    ctx.shadowColor =
      "rgba(108, 91, 255, .55)";

    ctx.shadowBlur = 15;

    ctx.fillStyle =
      paddleGradient;

    ctx.beginPath();

    ctx.roundRect(
      game.paddleX,
      CANVAS_HEIGHT - 30,
      PADDLE_WIDTH,
      PADDLE_HEIGHT,
      7
    );

    ctx.fill();

    ctx.restore();

    /* Ball glow + ball */
    const ballCX =
      game.ballX +
      BALL_SIZE / 2;

    const ballCY =
      game.ballY +
      BALL_SIZE / 2;

    const ballGlow =
      ctx.createRadialGradient(
        ballCX,
        ballCY,
        1,
        ballCX,
        ballCY,
        15
      );

    ballGlow.addColorStop(
      0,
      "rgba(255,246,190,.95)"
    );

    ballGlow.addColorStop(
      0.28,
      "rgba(255,210,75,.55)"
    );

    ballGlow.addColorStop(
      1,
      "rgba(255,180,40,0)"
    );

    ctx.fillStyle =
      ballGlow;

    ctx.beginPath();

    ctx.arc(
      ballCX,
      ballCY,
      15,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
      "#fff4b8";

    ctx.shadowColor =
      "#ffd34f";

    ctx.shadowBlur = 12;

    ctx.beginPath();

    ctx.arc(
      ballCX,
      ballCY,
      BALL_SIZE / 2,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;
  };

  const updateGame = (
    deltaSeconds = 1 / 60
  ) => {
    const game =
      gameStateRef.current;

    if (
      game.gameOver ||
      game.paused
    ) {
      return;
    }

    const dt = Math.min(
      Math.max(
        deltaSeconds,
        0.001
      ),
      FRAME_TIME_CAP
    );

    game.ballX +=
      game.ballSpeedX * dt;

    game.ballY +=
      game.ballSpeedY * dt;

    /* Trail */
    game.trail.push({
      x:
        game.ballX +
        BALL_SIZE / 2,

      y:
        game.ballY +
        BALL_SIZE / 2,
    });

    if (
      game.trail.length >
      9
    ) {
      game.trail.shift();
    }

    /* Particles */
    game.particles =
      game.particles
        .map(
          (particle) => ({
            ...particle,
            x:
              particle.x +
              particle.vx *
                dt,

            y:
              particle.y +
              particle.vy *
                dt,

            vy:
              particle.vy +
              160 * dt,

            life:
              particle.life -
              dt * 2.5,
          })
        )
        .filter(
          (particle) =>
            particle.life >
            0
        );

    /* Wall collision */
    if (
      game.ballX <= 0 ||
      game.ballX +
        BALL_SIZE >=
        CANVAS_WIDTH
    ) {
      game.ballX =
        Math.max(
          0,
          Math.min(
            game.ballX,
            CANVAS_WIDTH -
              BALL_SIZE
          )
        );

      game.ballSpeedX *=
        -1;
    }

    if (
      game.ballY <= 0
    ) {
      game.ballY = 0;

      game.ballSpeedY =
        Math.abs(
          game.ballSpeedY
        );
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

      const paddleCenter =
        game.paddleX +
        PADDLE_WIDTH / 2;

      const ballCenter =
        game.ballX +
        BALL_SIZE / 2;

      const normalizedHit =
        (ballCenter -
          paddleCenter) /
        (PADDLE_WIDTH / 2);

      const currentSpeed =
        Math.hypot(
          game.ballSpeedX,
          game.ballSpeedY
        );

      const nextSpeed =
        Math.min(
          MAX_BALL_SPEED,
          Math.max(
            INITIAL_BALL_SPEED,
            currentSpeed + 8
          )
        );

      const angle =
        normalizedHit *
        1.05;

      game.ballSpeedX =
        Math.sin(angle) *
        nextSpeed;

      game.ballSpeedY =
        -Math.cos(angle) *
        nextSpeed;

      game.combo = 0;
    }

    /* Block collision */
    for (const block of game.blocks) {
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
        block.active =
          false;

        const previousX =
          game.ballX -
          game.ballSpeedX *
            dt;

        const previousY =
          game.ballY -
          game.ballSpeedY *
            dt;

        if (
          previousX +
            BALL_SIZE <=
            block.x ||
          previousX >=
            block.x +
              block.width
        ) {
          game.ballSpeedX *=
            -1;
        } else {
          game.ballSpeedY *=
            -1;
        }

        const speed =
          Math.min(
            MAX_BALL_SPEED,
            Math.hypot(
              game.ballSpeedX,
              game.ballSpeedY
            ) + 5
          );

        const magnitude =
          Math.hypot(
            game.ballSpeedX,
            game.ballSpeedY
          );

        game.ballSpeedX =
          (game.ballSpeedX /
            magnitude) *
          speed;

        game.ballSpeedY =
          (game.ballSpeedY /
            magnitude) *
          speed;

        game.combo += 1;

        game.score +=
          10 +
          Math.min(
            game.combo * 2,
            20
          );

        game.hitFlash = 0.12;

        const centerX =
          block.x +
          block.width / 2;

        const centerY =
          block.y +
          block.height / 2;

        const colors = [
          "#a99cff",
          "#69d7ff",
          "#70e4bd",
          "#ffd45e",
        ];

        for (
          let i = 0;
          i < 10;
          i += 1
        ) {
          const angle =
            (Math.PI * 2 * i) /
            10;

          const speed =
            45 +
            Math.random() *
              80;

          game.particles.push(
            {
              x: centerX,
              y: centerY,
              vx:
                Math.cos(angle) *
                speed,
              vy:
                Math.sin(angle) *
                speed,
              size:
                1.5 +
                Math.random() *
                  2.5,
              life: 1,
              color:
                colors[
                  i %
                    colors.length
                ],
            }
          );
        }

        setScore(
          game.score
        );

        break;
      }
    }

    game.hitFlash =
      Math.max(
        0,
        game.hitFlash -
          dt
      );

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

    /* Lose a life */
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

  const gameLoop = (
    timestamp
  ) => {
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

    const previous =
      game.lastFrameTime ||
      timestamp;

    const deltaSeconds =
      (timestamp -
        previous) /
      1000;

    game.lastFrameTime =
      timestamp;

    updateGame(
      deltaSeconds
    );

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

    if (
      animationRef.current !==
      null
    ) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    animationRef.current =
      requestAnimationFrame(
        gameLoop
      );

    return () => {
      if (
        animationRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationRef.current
        );

        animationRef.current =
          null;
      }
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

      if (
        animationRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationRef.current
        );

        animationRef.current =
          null;
      }
    };
  }, []);

  const startFromGuide = () => {
    localStorage.setItem(
      GUIDE_STORAGE_KEY,
      "true"
    );

    setShowGuide(false);
  };

  useEffect(
    () => () =>
      window.clearTimeout(
        rewardTimerRef.current
      ),
    []
  );

  return (
    <main
      className={
        styles.page
      }
    >
      {/* HEADER */}

      <header
        className={
          styles.header
        }
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

        <div
          className={
            styles.balanceGroup
          }
          aria-label="Balances"
        >
          <div
            className={
              styles.coinBalance
            }
          >
            <img
              src={tokenImage}
              alt="Tokens"
              className={
                styles.tokenIcon
              }
            />

            <span>
              {tokens}
            </span>

            <small>
              Tokens
            </small>
          </div>

          <div
            className={
              styles.coinBalance
            }
          >
            <img
              src={gameCoinImage}
              alt="Game Coins"
              className={
                styles.coinIcon
              }
            />

            <strong>
              {gameCoins}
            </strong>

            <small>
              Game Coins
            </small>
          </div>
        </div>
      </header>

      {/* HUD */}

      <section
        className={
          styles.hud
        }
      >
        <div
          className={
            styles.hudCard
          }
        >
          <span>
            SCORE
          </span>

          <strong>
            {score}
          </strong>
        </div>

        <div
          className={
            styles.hudCard
          }
        >
          <span>
            LIVES
          </span>

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
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            handlePointerUp
          }
          onPointerCancel={
            handlePointerUp
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

              <p
                className={
                  styles.modalIntro
                }
              >
                Keep the ball in play,
                break the blocks, and
                beat your high score.
              </p>

              <div
                className={
                  styles.guideSteps
                }
              >
                <div
                  className={
                    styles.guideStep
                  }
                >
                  <span
                    className={
                      styles.guideIcon
                    }
                  >
                    ↔
                  </span>

                  <div>
                    <strong>
                      Move the paddle
                    </strong>

                    <span>
                      Drag on mobile,
                      move your mouse,
                      or use ← →.
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.guideStep
                  }
                >
                  <span
                    className={
                      styles.guideIcon
                    }
                  >
                    ●
                  </span>

                  <div>
                    <strong>
                      Keep the ball alive
                    </strong>

                    <span>
                      Catch every bounce
                      with the paddle.
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.guideStep
                  }
                >
                  <span
                    className={
                      styles.guideIcon
                    }
                  >
                    ▦
                  </span>

                  <div>
                    <strong>
                      Crush the blocks
                    </strong>

                    <span>
                      Each broken block
                      adds points to
                      your score.
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.guideStep
                  }
                >
                  <span
                    className={
                      styles.guideIcon
                    }
                  >
                    ♥
                  </span>

                  <div>
                    <strong>
                      Protect your 3 lives
                    </strong>

                    <span>
                      Clear the board
                      before you run
                      out of lives.
                    </span>
                  </div>
                </div>
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
                onClick={
                  closeHowToPlay
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
                Keep your paddle
                under the ball and
                destroy every block.
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
                onClick={
                  closeHowToPlay
                }
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* PAUSE */}

        {paused &&
          !showHowToPlay && (
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
      </section>

      {/* RESULT */}

      {resultVisible && (
        <div
          className={
            styles.overlay
          }
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex: 99999,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            pointerEvents:
              "auto",
          }}
        >
          <div
            className={
              styles.modal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-result-title"
          >
            {!rewardStage ? (
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

                <div
                  className={
                    styles.rewardCelebration
                  }
                  aria-live="polite"
                >
                  <p
                    className={
                      styles.reward
                    }
                  >
                    <img
                      src={
                        gameCoinImage
                      }
                      alt=""
                      className={
                        styles.coinIcon
                      }
                    />

                    +{reward} Game Coins
                  </p>
                </div>

                {!reviveUsed &&
                  lives <= 0 && (
                    <button
                      type="button"
                      className={
                        styles.primaryButton
                      }
                      onClick={
                        reviveGame
                      }
                    >
                      ❤️ Revive
                    </button>
                  )}

                <button
                  type="button"
                  className={
                    styles.secondaryButton
                  }
                  onClick={
                    collectRewardAndGoHome
                  }
                >
                  {lives > 0
                    ? "Collect Reward"
                    : "No Thanks"}
                </button>
              </>
            ) : (
              <div
                className={
                  styles.rewardFlow
                }
                aria-live="polite"
              >
                {rewardStage ===
                  "celebrate" && (
                  <>
                    <div
                      className={
                        styles.trophyWrap
                      }
                      aria-hidden="true"
                    >
                      <span
                        className={
                          styles.trophyGlow
                        }
                      >
                        ✦
                      </span>

                      <span
                        className={
                          styles.trophy
                        }
                      >
                        🏆
                      </span>

                      <span
                        className={
                          styles.trophySpark
                        }
                      >
                        ✦
                      </span>
                    </div>

                    <span
                      className={
                        styles.rewardKicker
                      }
                    >
                      CONGRATULATIONS!
                    </span>

                    <h3
                      className={
                        styles.rewardTitle
                      }
                    >
                      You Earned
                    </h3>

                    <div
                      className={
                        styles.rewardAmount
                      }
                    >
                      <img
                        src={
                          gameCoinImage
                        }
                        alt=""
                        className={
                          styles.rewardCoinLarge
                        }
                      />

                      +{reward} Game Coins
                    </div>

                    <p
                      className={
                        styles.rewardMessage
                      }
                    >
                      Great game! Your
                      reward is ready.
                    </p>
                  </>
                )}

                {rewardStage ===
                  "flight" && (
                  <>
                    <div
                      className={
                        styles.coinFlightScene
                      }
                      aria-hidden="true"
                    >
                      <div
                        className={
                          styles.coinSource
                        }
                      >
                        <img
                          src={
                            gameCoinImage
                          }
                          alt=""
                        />
                      </div>

                      {Array.from(
                        {
                          length: 9,
                        }
                      ).map(
                        (_, index) => (
                          <img
                            key={`block-flight-${index}`}
                            src={
                              gameCoinImage
                            }
                            alt=""
                            className={
                              styles.flyingCoin
                            }
                            style={{
                              "--i":
                                index,
                              "--dx": `${
                                (index -
                                  4) *
                                24
                              }px`,
                              "--delay": `${
                                index *
                                70
                              }ms`,
                            }}
                          />
                        )
                      )}

                      <div
                        className={
                          styles.coinTarget
                        }
                      >
                        <img
                          src={
                            gameCoinImage
                          }
                          alt=""
                        />

                        <strong>
                          {gameCoins}
                        </strong>
                      </div>
                    </div>

                    <h3
                      className={
                        styles.rewardTitle
                      }
                    >
                      Coins Flying to Balance
                    </h3>

                    <p
                      className={
                        styles.rewardMessage
                      }
                    >
                      Your Game Coins are
                      being added.
                    </p>
                  </>
                )}

                {rewardStage ===
                  "summary" && (
                  <>
                    <div
                      className={
                        styles.summaryCheck
                      }
                      aria-hidden="true"
                    >
                      ✓
                    </div>

                    <span
                      className={
                        styles.rewardKicker
                      }
                    >
                      REWARD COLLECTED
                    </span>

                    <h3
                      className={
                        styles.rewardTitle
                      }
                    >
                      Awesome!
                    </h3>

                    <p
                      className={
                        styles.rewardMessage
                      }
                    >
                      {reward} Game Coins
                      have been added to
                      your balance.
                    </p>

                    <div
                      className={
                        styles.newBalance
                      }
                    >
                      <img
                        src={
                          gameCoinImage
                        }
                        alt=""
                        className={
                          styles.rewardCoin
                        }
                      />

                      <strong>
                        {gameCoins}
                      </strong>

                      <span>
                        +{reward}
                      </span>
                    </div>

                    <div
                      className={
                        styles.rewardProgress
                      }
                    >
                      <span />
                    </div>

                    <button
                      type="button"
                      className={
                        styles.primaryButton
                      }
                      onClick={() =>
                        navigate(
                          "/games/block-crush"
                        )
                      }
                    >
                      Continue
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
                  setPaused(
                    false
                  );

                  gameStateRef.current.paused =
                    false;

                  gameStateRef.current.lastFrameTime =
                    0;

                  if (
                    animationRef.current !==
                    null
                  ) {
                    cancelAnimationFrame(
                      animationRef.current
                    );
                  }

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
        !paused &&
        !showHowToPlay && (
          <button
            type="button"
            className={
              styles.guideButton
            }
            onClick={
              openHowToPlay
            }
          >
            How to Play
          </button>
        )}

      {/* STOP BUTTON */}

      {!gameOver &&
        !showGuide &&
        !paused &&
        !showHowToPlay && (
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