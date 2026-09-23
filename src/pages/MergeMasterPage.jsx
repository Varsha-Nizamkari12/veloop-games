import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorState from "../components/ui/ErrorState.jsx";
import { useGame } from "../context/GameContext.jsx";

import gameImage from "../assets/images/avif/veloop-avif-assets/images/10.avif";
import gameCoinImage from "../assets/images/avif/veloop-avif-assets/images/game_coin.avif";
import tokenImage from "../assets/images/avif/veloop-avif-assets/images/multi_token.avif";

import styles from "./MergeMasterPage.module.css";

const ENTRY_FEE = 20;

function MergeMasterPage() {
  const navigate = useNavigate();

  const {
    tokens,
    gameCoins,
    hasEnoughTokens,
    deductTokens,
  } = useGame();

  const [showGuide, setShowGuide] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState(false);

  useEffect(() => {
    return () => clearTimeout(window.__veloopStartTimer);
  }, []);

  const canPlay = hasEnoughTokens(ENTRY_FEE);

  const handlePlay = () => {
  if (!canPlay || isStarting) {
    return;
  }

  const deducted = deductTokens(ENTRY_FEE);

  if (!deducted) {
    return;
  }

  setStartError(false);
  setIsStarting(true);

  window.setTimeout(() => {
    navigate("/games/merge-master/play", {
      replace: true,
    });
  }, 350);
};

  return (
    <main className={styles.page}>
      {startError ? (
        <ErrorState
          message="We couldn't start the game. Your Tokens were not charged again."
          onRetry={() => { setStartError(false); setIsStarting(false); }}
          onBack={() => navigate("/games")}
        />
      ) : null}
      <section className={styles.gameHome}>
        {/* HEADER */}
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/games")}
            aria-label="Back to games"
            disabled={isStarting}
          >
            ←
          </button>

          <div className={styles.titleBlock}>
            <span className={styles.eyebrow}>
              VELOOP GAME
            </span>

            <h1>Merge Master</h1>
          </div>

          <div className={styles.coinBalance}>
            <img
              src={gameCoinImage}
              alt="Game Coins"
              className={styles.coinIcon}
            />

            <div>
              <strong>{gameCoins}</strong>
              <span>Game Coins</span>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.imageWrapper}>
            <img
              src={gameImage}
              alt="Merge Master game artwork"
              className={styles.gameImage}
            />
          </div>

          <span className={styles.category}>
            PUZZLE CHALLENGE
          </span>

          <h2>Merge Master</h2>

          <p className={styles.description}>
            Merge matching numbers, build powerful
            tiles, and chase your highest score.
          </p>
        </section>

        {/* ENTRY CARD */}
        <section className={styles.entryCard}>
          <div className={styles.entryTop}>
            <div>
              <span className={styles.entryLabel}>
                ENTRY FEE
              </span>

              <div className={styles.entryFee}>
                <img
                  src={tokenImage}
                  alt=""
                  aria-hidden="true"
                  className={styles.tokenIcon}
                />

                <strong>{ENTRY_FEE} Tokens</strong>
              </div>
            </div>

            <div className={styles.balance}>
              <span>Balance</span>
              <strong>{tokens} Tokens</strong>
            </div>
          </div>

          {canPlay ? (
            <button
              type="button"
              className={styles.playButton}
              onClick={handlePlay}
              disabled={isStarting}
              aria-busy={isStarting}
            >
              <span>
                {isStarting ? "Starting..." : "Play Now"}
              </span>

              {!isStarting && (
                <span aria-hidden="true">→</span>
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                className={styles.disabledButton}
                disabled
              >
                Need 20 Tokens
              </button>

              <button
                type="button"
                className={styles.earnButton}
                onClick={() => navigate("/games")}
              >
                Earn More Tokens
              </button>

              <p className={styles.insufficientText}>
                You need 20 Tokens to start this game.
              </p>
            </>
          )}
        </section>

        {/* HOW TO PLAY */}
        <button
          type="button"
          className={styles.guideButton}
          onClick={() => setShowGuide(true)}
          disabled={isStarting}
        >
          How to Play
        </button>

        {/* GUIDE MODAL */}
        {showGuide && (
          <div className={styles.overlay}>
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="merge-guide-title"
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowGuide(false)}
                aria-label="Close guide"
              >
                ×
              </button>

              <span className={styles.modalLabel}>
                MERGE MASTER
              </span>

              <h2 id="merge-guide-title">
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
                className={styles.modalButton}
                onClick={() => setShowGuide(false)}
              >
                Got It!
              </button>
            </div>
          </div>
        )}
      </section>

        {isStarting && (
          <div className={styles.startOverlay} role="status" aria-live="polite">
            <div className={styles.startLoader}>
              <span aria-hidden="true">✦</span>
              <strong>Preparing Merge Master</strong>
              <p>Getting your challenge ready...</p>
            </div>
          </div>
        )}

            {/* BOTTOM NAVIGATION */}
      <nav
        className={styles.bottomNav}
        aria-label="Game navigation"
      >
        <button
          type="button"
          className={`${styles.navItem} ${styles.active}`}
          onClick={() => navigate("/games")}
          disabled={isStarting}
        >
          <span>⌂</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={() => navigate("/redeem")}
          disabled={isStarting}
        >
          <span>◇</span>
          <span>Redeem</span>
        </button>
      </nav>
    </main>
  );
}

export default MergeMasterPage;