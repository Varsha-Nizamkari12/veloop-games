import { useState } from "react";
import { useNavigate } from "react-router-dom";

import tokenImage from "../../assets/images/avif/veloop-avif-assets/images/token-transparent.avif";
import { useGame } from "../../context/GameContext.jsx";

import styles from "./GameCard.module.css";

const ENTRY_COST = 20;

function GameCard({ game }) {
  const navigate = useNavigate();

  const {
    tokens,
    hasEnoughTokens,
  } = useGame();

  const [loading, setLoading] = useState(false);

  if (!game) {
    return null;
  }

  const enoughTokens = hasEnoughTokens
    ? hasEnoughTokens(ENTRY_COST)
    : tokens >= ENTRY_COST;

  const isBlockCrush =
    String(game.id) === "4" ||
    game.name?.toLowerCase().includes("block crush");

  const isMergeMaster =
    String(game.id) === "10" ||
    game.name?.toLowerCase().includes("merge master");

  const playable =
    isBlockCrush ||
    isMergeMaster ||
    game.playable === true;

  const handlePlay = () => {
    if (loading) {
      return;
    }

    if (!enoughTokens) {
      return;
    }

    setLoading(true);

    window.setTimeout(() => {
      try {
        if (isBlockCrush) {
          navigate("/games/block-crush");
          return;
        }

        if (isMergeMaster) {
          navigate("/games/merge-master");
          return;
        }

        if (game.route) {
          navigate(game.route);
          return;
        }

        window.alert(
          `${game.name || "This game"} is coming soon!`
        );
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const gameName =
    game.name ||
    game.title ||
    `Game ${game.id}`;

  const image =
    game.image ||
    game.img ||
    game.banner;

  return (
    <article
      className={[
        styles.card,
        !enoughTokens && playable
          ? styles.insufficient
          : "",
        !playable
          ? styles.disabled
          : "",
      ].join(" ")}
    >
      {/* =====================================================
          ARTWORK
      ===================================================== */}

      <div className={styles.artwork}>
        {game.badge ? (
          <span className={styles.badge}>
            {game.badge}
          </span>
        ) : null}

        <img
          src={image}
          alt={`${gameName} game banner`}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* =====================================================
          CODED ACTION AREA
      ===================================================== */}

      <div className={styles.cardBody}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>
            {gameName}
          </h3>

          <span className={styles.gameNumber}>
            {String(game.id).padStart(2, "0")}
          </span>
        </div>

        <div className={styles.actionRow}>
          {/* TOKEN COST */}

          <div
            className={styles.tokenCost}
            aria-label={`${ENTRY_COST} Tokens required`}
          >
            <img
              src={tokenImage}
              alt=""
              aria-hidden="true"
            />

            <span>
              <strong>{ENTRY_COST}</strong>{" "}
              Tokens
            </span>
          </div>

          {/* PLAY */}

          {playable ? (
            <button
              type="button"
              className={[
                styles.playButton,
                loading
                  ? styles.loadingButton
                  : "",
                !enoughTokens
                  ? styles.insufficientButton
                  : "",
              ].join(" ")}
              onClick={handlePlay}
              disabled={loading}
              aria-label={
                enoughTokens
                  ? `Play ${gameName} for ${ENTRY_COST} Tokens`
                  : `Not enough Tokens to play ${gameName}`
              }
            >
              {loading ? (
                <>
                  <span
                    className={styles.loadingSpinner}
                    aria-hidden="true"
                  />

                  <span>
                    Starting...
                  </span>
                </>
              ) : enoughTokens ? (
                <>
                  <span>
                    Play Now
                  </span>

                  <span
                    className={styles.arrow}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Need 20
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className={[
                styles.playButton,
                styles.insufficientButton,
              ].join(" ")}
              onClick={() => {
                window.alert(
                  `${gameName} is coming soon!`
                );
              }}
            >
              <span>
                Play Now
              </span>

              <span
                className={styles.arrow}
                aria-hidden="true"
              >
                →
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default GameCard;