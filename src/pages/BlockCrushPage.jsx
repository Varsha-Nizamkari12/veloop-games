import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";

import blockCrushImage from "../assets/images/4.jpeg";
import gameCoinImage from "../assets/images/game_coin.jpeg";
import tokenImage from "../assets/images/multi_token.jpeg";

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

  const handlePlay = () => {
  if (!hasEnoughTokens(20)) {
    return;
  }

  const deducted = deductTokens(20);

  if (!deducted) {
    return;
  }

  navigate("/games/block-crush/play");
};

  const enoughTokens = tokens >= 20;

  return (
    <main className={styles.page}>
      <section className={styles.gameHome}>
        {/* Header */}
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/games")}
            aria-label="Back to games"
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
          className={styles.playButton}
          onClick={handlePlay}
          disabled={!enoughTokens}
        >
          <span>
            {enoughTokens
              ? "Play Now"
              : "Need 20 Tokens"}
          </span>

          {enoughTokens && (
            <span className={styles.arrow}>
              →
            </span>
          )}
        </button>

        {!enoughTokens && (
          <button
            type="button"
            className={styles.earnButton}
          >
            Earn More Tokens
          </button>
        )}

        {/* How To Play */}
        <button
          type="button"
          className={styles.guideButton}
          onClick={() => setShowGuide(true)}
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

              <p>
                Move the paddle to bounce the ball
                and destroy all the blocks.
              </p>

              <ul>
                <li>Use your mouse to move.</li>
                <li>Use ← and → on desktop.</li>
                <li>Drag across the game on mobile.</li>
                <li>You have 3 lives.</li>
                <li>Each block gives you 10 points.</li>
              </ul>

              <button
                type="button"
                className={styles.modalButton}
                onClick={() => setShowGuide(false)}
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bottom Navigation */}
      <nav
        className={styles.bottomNav}
        aria-label="Game navigation"
      >
        <button
          type="button"
          className={`${styles.navItem} ${styles.activeNav}`}
          onClick={() =>
            navigate("/games/block-crush")
          }
        >
          <span className={styles.navIcon}>⌂</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={() => navigate("/redeem")}
        >
          <span className={styles.navIcon}>◇</span>
          <span>Redeem</span>
        </button>
      </nav>
    </main>
  );
}

export default BlockCrushPage;