import { useState } from "react";
import { useNavigate } from "react-router-dom";
import tokenImage from "../../assets/images/avif/veloop-avif-assets/images/token-transparent.avif";
import { useGame } from "../../context/GameContext";
import styles from "./GameCard.module.css";

function GameCard({ game }) {
  const navigate = useNavigate();
  const { tokens, hasEnoughTokens } = useGame();
  const [isLoading, setIsLoading] = useState(false);

  const canAfford = hasEnoughTokens(20);

  const handlePlay = () => {
    if (game.playable) {
      if (!canAfford) {
        return;
      }

      setIsLoading(true);

      if (game.id === 4) {
        navigate("/games/block-crush");
        return;
      }

      if (game.id === 10) {
        navigate("/games/merge-master");
        return;
      }
    }

    alert(`${game.name} is coming soon!`);
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={game.image}
          alt={`${game.name} game artwork`}
          className={styles.image}
          loading="lazy"
        />
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{game.name}</h2>

        <div className={styles.tokenCost}>
          <img
            src={tokenImage}
            alt=""
            aria-hidden="true"
            className={styles.tokenIcon}
          />

          <span>20 Tokens</span>
        </div>

        <button
          type="button"
          className={`${styles.button} ${
            game.playable && !canAfford
              ? styles.insufficient
              : ""
          }`}
          onClick={handlePlay}
          disabled={game.playable && (!canAfford || isLoading)}
          aria-label={
            isLoading
              ? `Starting ${game.name}`
              : game.playable
                ? canAfford
                  ? `Play ${game.name} for 20 Tokens`
                  : `Not enough Tokens to play ${game.name}`
                : `Play ${game.name}`
          }
        >
          <span>
            {isLoading
              ? "Starting..."
              : game.playable && !canAfford
                ? "Need 20 Tokens"
                : "Play Now"}
          </span>
        </button>

        {game.playable && !canAfford && (
          <p className={styles.balanceText}>
            Balance: {tokens} Tokens
          </p>
        )}
      </div>
    </article>
  );
}

export default GameCard;