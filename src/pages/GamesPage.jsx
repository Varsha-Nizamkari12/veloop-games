import gameCoinImage from "../assets/images/avif/veloop-avif-assets/images/game_coin.avif";
import tokenImage from "../assets/images/avif/veloop-avif-assets/images/token-transparent.avif";
import GamesGrid from "../components/games/GamesGrid";
import { useGame } from "../context/GameContext.jsx";

import styles from "./GamesPage.module.css";

function GamesPage() {
  const { gameCoins, tokens } = useGame();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>VELOOP REWARDS</span>
          <h1>Games</h1>
          <p>Play. Win. Earn.</p>
        </div>

        <div className={styles.balances}>
          <div className={styles.balance}>
            <img src={gameCoinImage} alt="" />
            <div>
              <span>Game Coins</span>
              <strong>{gameCoins}</strong>
            </div>
          </div>

          <div className={styles.balance}>
            <img src={tokenImage} alt="" />
            <div>
              <span>Tokens</span>
              <strong>{tokens}</strong>
            </div>
          </div>
        </div>
      </header>

      <GamesGrid />
    </main>
  );
}

export default GamesPage;