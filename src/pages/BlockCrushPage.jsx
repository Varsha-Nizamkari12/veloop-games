import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";

import blockCrushImage from "../assets/images/avif/veloop-avif-assets/images/4.avif";
import gameCoinImage from "../assets/images/avif/veloop-avif-assets/images/game_coin.avif";
import tokenImage from "../assets/images/avif/veloop-avif-assets/images/multi_token.avif";

import styles from "./BlockCrushPage.module.css";

function BlockCrushPage() {
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

  const enoughTokens = hasEnoughTokens(20);

  const handlePlay = () => {
    if (!enoughTokens || isStarting) {
      return;
    }

    const deducted = deductTokens(20);

    if (!deducted) {
      return;
    }

    setStartError(false);
    setIsStarting(true);

    window.__veloopStartTimer = window.setTimeout(() => {
      try {
        navigate("/games/block-crush/play");
      } catch {
        setIsStarting(false);
        setStartError(true);
      }
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
        {/* Header */}
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

          <div className={styles.coinBalance}>
            <img
              src={gameCoinImage}
              alt="Game Coins"
              className={styles.coinIcon}
            />

            <div>
              <span className={styles.coinValue}>
                {gameCoins}
              </span>

              <span className={styles.coinLabel}>
                Game Coins
              </span>
            </div>
          </div>
        </header>

        {/* Game Artwork */}
        <section className={styles.hero}>
          <img
            src={blockCrushImage}
            alt="Block Crush game artwork"
            className={styles.heroImage}
          />

          <div className={styles.heroGlow} />
        </section>

        {/* Game Information */}
        <section className={styles.gameInfo}>
          <span className={styles.category}>
            PUZZLE CHALLENGE
          </span>

          <h1 className={styles.title}>
            Block Crush
          </h1>

          <p className={styles.description}>
            Break the blocks, keep the ball alive,
            and build your highest score.
          </p>
        </section>

        {/* Entry Card */}
        <section className={styles.entryCard}>
          <div>
            <span className={styles.entryLabel}>
              ENTRY FEE
            </span>

            <div className={styles.entryCost}>
              <img
                src={tokenImage}
                alt=""
                aria-hidden="true"
                className={styles.tokenIcon}
              />

              <strong>20 Tokens</strong>
            </div>
          </div>

          <span className={styles.balanceText}>
            Balance: {tokens} Tokens
          </span>
        </section>

        {/* Play Button */}
        <button
          type="button"
          className={
            enoughTokens
              ? styles.playButton
              : styles.disabledButton
          }
          onClick={handlePlay}
          disabled={!enoughTokens || isStarting}
          aria-busy={isStarting}
        >
          <span>
            {isStarting
              ? "Starting..."
              : enoughTokens
                ? "Play Now"
                : "Need 20 Tokens"}
          </span>

          {enoughTokens && !isStarting && (
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          )}
        </button>

        {!enoughTokens && (
          <button
            type="button"
            className={styles.earnButton}
            onClick={() => navigate("/games")}
          >
            Earn More Tokens
          </button>
        )}

        {/* How To Play */}
        <button
          type="button"
          className={styles.guideButton}
          onClick={() => setShowGuide(true)}
          disabled={isStarting}
        >
          How to Play
        </button>

        {/* Guide Modal */}
        {showGuide && (
          <div className={styles.modalOverlay}>
            <div
              className={styles.guideModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="guide-title"
            >
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowGuide(false)}
                aria-label="Close guide"
              >
                ×
              </button>

              <span className={styles.category}>
                BLOCK CRUSH
              </span>

              <h2 id="guide-title">
                How to Play
              </h2>

              <p className={styles.modalIntro}>
                Clear blocks, keep the ball in play, and chase your highest score.
              </p>

              <div className={styles.guideSteps}>
                <div className={styles.guideStep}>
                  <span className={styles.guideIcon} aria-hidden="true">↔</span>
                  <div><strong>Move the paddle</strong><span>Use your mouse, drag on mobile, or press ← →.</span></div>
                </div>
                <div className={styles.guideStep}>
                  <span className={styles.guideIcon} aria-hidden="true">✦</span>
                  <div><strong>Break the blocks</strong><span>Hit blocks with the ball to score points.</span></div>
                </div>
                <div className={styles.guideStep}>
                  <span className={styles.guideIcon} aria-hidden="true">♥</span>
                  <div><strong>Protect your lives</strong><span>You have 3 lives. Keep the ball above the paddle.</span></div>
                </div>
                <div className={styles.guideStep}>
                  <span className={styles.guideIcon} aria-hidden="true">🏆</span>
                  <div><strong>Get the highest score</strong><span>Clear every block and finish the challenge.</span></div>
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
              <strong>Preparing Block Crush</strong>
              <p>Getting your challenge ready...</p>
            </div>
          </div>
        )}

            {/* Bottom Navigation */}
      <nav
        className={styles.bottomNav}
        aria-label="Game navigation"
      >
        <button
          type="button"
          className={`${styles.navItem} ${styles.activeNav}`}
          onClick={() => navigate("/games/block-crush")}
          disabled={isStarting}
        >
          <span className={styles.navIcon}>⌂</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={() => navigate("/redeem")}
          disabled={isStarting}
        >
          <span className={styles.navIcon}>◇</span>
          <span>Redeem</span>
        </button>
      </nav>
    </main>
  );
}

export default BlockCrushPage;