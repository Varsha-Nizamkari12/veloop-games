import { useNavigate } from "react-router-dom";
import { useGame } from "../../context/GameContext";

import tokenImage from "../../assets/images/multi_token.jpeg";
import styles from "./GameCard.module.css";

function GameCard({ game }) {
  const navigate = useNavigate();
  const { tokens, hasEnoughTokens } = useGame();

  const canAfford = hasEnoughTokens(20);

  const handlePlay = () => {
    // The two fully playable games
    if (game.playable) {
      if (!canAfford) {
        return;
      }

      if (game.id === 4) {
        navigate("/games/block-crush");
        return;
      }

      if (game.id === 10) {
        navigate("/games/merge-master");
        return;
      }
    }

    // Other games are not playable yet
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
          disabled={game.playable && !canAfford}
          aria-label={
            game.playable
              ? canAfford
                ? `Play ${game.name} for 20 Tokens`
                : `Not enough Tokens to play ${game.name}`
              : `Play ${game.name}`
          }
        >
          <span>
            {game.playable && !canAfford ? "Need 20 Tokens" : "Play Now"}
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