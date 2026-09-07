import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";

import gameImage from "../assets/images/10.jpeg";
import gameCoinImage from "../assets/images/game_coin.jpeg";
import tokenImage from "../assets/images/multi_token.jpeg";

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

  const canPlay = hasEnoughTokens(ENTRY_FEE);

  const handlePlay = () => {
    if (!canPlay) {
      return;
    }

    const deducted = deductTokens(ENTRY_FEE);

    if (!deducted) {
      return;
    }

    navigate("/games/merge-master/play");
  };

  return (
    <main className={styles.page}>
      <section className={styles.gameHome}>
        {/* HEADER */}
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/games")}
            aria-label="Back to games"
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
            >
              <span>Play Now</span>
              <span aria-hidden="true">→</span>
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

              <p>
                Combine matching number tiles to create
                larger values.
              </p>

              <ul>
                <li>
                  Swipe the board or use arrow keys.
                </li>
                <li>
                  Matching tiles merge into one.
                </li>
                <li>
                  Every merge increases your score.
                </li>
                <li>
                  Reach 2048 to win.
                </li>
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

      {/* BOTTOM NAVIGATION */}
      <nav
        className={styles.bottomNav}
        aria-label="Game navigation"
      >
        <button
          type="button"
          className={`${styles.navItem} ${styles.active}`}
          onClick={() => navigate("/games")}
        >
          <span>⌂</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={() => navigate("/redeem")}
        >
          <span>◇</span>
          <span>Redeem</span>
        </button>
      </nav>
    </main>
  );
}

export default MergeMasterPage;