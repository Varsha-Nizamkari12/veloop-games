import { Link } from "react-router-dom";

import gameCoinImage from "../assets/images/avif/veloop-avif-assets/images/game_coin.avif";
import tokenImage from "../assets/images/avif/veloop-avif-assets/images/token-transparent.avif";
import heroBackground from "../assets/images/avif/veloop-avif-assets/images/veloop-gaming-hero.avif";

import GamesGrid from "../components/games/GamesGrid";
import { useGame } from "../context/GameContext.jsx";

import styles from "./GamesPage.module.css";

/* =========================
   GAME ICON
========================= */

function GameIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 8.5h10a4.5 4.5 0 0 1 4.32 5.76l-1.1 3.72a2.4 2.4 0 0 1-4.48.32l-.75-1.55H8.01l-.75 1.55a2.4 2.4 0 0 1-4.48-.32l-1.1-3.72A4.5 4.5 0 0 1 6 8.5h1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11v4M5 13h4M16.5 12.2h.01M19 14.3h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================
   GIFT ICON
========================= */

function GiftIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10h16v10H4zM3 7h18v3H3z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M12 7v13M12 7H8.7A2.2 2.2 0 1 1 10 2.9C11.5 4 12 7 12 7ZM12 7h3.3A2.2 2.2 0 1 0 14 2.9C12.5 4 12 7 12 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================
   COIN ICON
========================= */

function CoinIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M12 7.5v9M9.5 10.2c0-.95.9-1.7 2.5-1.7s2.5.75 2.5 1.7c0 1-.9 1.45-2.5 1.8s-2.5.8-2.5 1.8c0 .95.9 1.7 2.5 1.7s2.5-.75 2.5-1.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================
   ARROW
========================= */

function ArrowIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h13M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================
   MAIN PAGE
========================= */

function GamesPage() {
  const { gameCoins, tokens } = useGame();

  return (
    <main className={styles.page}>
      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav className={styles.navbar}>
        {/* BRAND */}

        <Link
          to="/games"
          className={styles.brand}
          aria-label="VELOOP Games"
        >
          <span className={styles.brandLogo}>
            <span>V</span>
          </span>

          <span className={styles.brandWords}>
            <strong>VELOOP</strong>
            <small>REWARDS</small>
          </span>
        </Link>

        {/* NAVIGATION */}

        <div className={styles.navLinks}>
          <Link
            to="/games"
            className={`${styles.navLink} ${styles.active}`}
          >
            <GameIcon size={18} />
            <span>Games</span>
          </Link>

          <Link
            to="/redeem"
            className={styles.navLink}
          >
            <GiftIcon size={18} />
            <span>Redeem</span>
          </Link>
        </div>

        {/* RIGHT */}

        <div className={styles.navRight}>
          <div className={styles.coinBalance}>
            <img
              src={gameCoinImage}
              alt=""
              aria-hidden="true"
            />

            <div>
              <strong>{gameCoins}</strong>
              <span>Game Coins</span>
            </div>
          </div>

          <div className={styles.playerBox}>
            <span className={styles.playerAvatar}>
              V
            </span>

            <div>
              <strong>Hey Player!</strong>
              <span>Good to see you!</span>
            </div>
          </div>
        </div>
      </nav>

      {/* =====================================
          HERO
      ===================================== */}

      <section
        className={styles.hero}
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      >
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <span className={styles.heroLabel}>
            PLAY • EARN • REDEEM
          </span>

          <h1>
            PLAY GAMES
            <br />
            <span>EARN REWARDS</span>
          </h1>

          <p>
            Turn your playtime into real rewards.
            Explore exciting games,
            <br />
            complete challenges, and collect Game
            Coins every day.
          </p>

          <a
            href="#games-for-you"
            className={styles.heroButton}
          >
            <GameIcon size={18} />
            <span>START PLAYING</span>
            <ArrowIcon size={17} />
          </a>

          {/* HERO STATS */}

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatIcon}>
                <GameIcon size={22} />
              </span>

              <div>
                <strong>13+</strong>
                <span>Exciting Games</span>
              </div>
            </div>

            <div className={styles.statLine} />

            <div className={styles.heroStat}>
              <span className={styles.heroStatIcon}>
                <CoinIcon size={22} />
              </span>

              <div>
                <strong>Play & Earn</strong>
                <span>Game Coins</span>
              </div>
            </div>

            <div className={styles.statLine} />

            <div className={styles.heroStat}>
              <span className={styles.heroStatIcon}>
                <GiftIcon size={22} />
              </span>

              <div>
                <strong>Redeem</strong>
                <span>Amazing Rewards</span>
              </div>
            </div>
          </div>
        </div>

        {/* HERO QUOTE */}

        <div className={styles.heroQuote}>
          <span>GOOD GAMES.</span>
          <strong>GREATER REWARDS.</strong>
        </div>
      </section>

      {/* =====================================
          GAMES
      ===================================== */}

      <section
        id="games-for-you"
        className={styles.gamesSection}
      >
        <div className={styles.gamesPanel}>
          {/* HEADER */}

          <div className={styles.gamesHeader}>
            <div className={styles.gamesHeading}>
              <span className={styles.gamesIcon}>
                <GameIcon size={25} />
              </span>

              <div>
                <h2>Games for You</h2>

                <p>
                  13 amazing games. Play, earn and
                  redeem!
                </p>
              </div>
            </div>

            <div className={styles.gamesPause}>
              <span className={styles.pauseCircle}>
                II
              </span>

              <div>
                <strong>Carousel</strong>
                <span>Explore games</span>
              </div>
            </div>
          </div>

          {/* YOUR EXISTING 13-GAME CAROUSEL */}

          <GamesGrid />

          {/* TOKEN INFORMATION */}

          <div className={styles.gamesBottom}>
            <div className={styles.tokenInfo}>
              <img
                src={tokenImage}
                alt=""
                aria-hidden="true"
              />

              <span>
                You have{" "}
                <strong>{tokens}</strong>{" "}
                Tokens
              </span>
            </div>

            <span className={styles.playHint}>
              Every game costs 20 Tokens
            </span>
          </div>
        </div>
      </section>

      {/* =====================================
          BENEFITS
      ===================================== */}

      <section className={styles.benefits}>
        <div className={styles.benefit}>
          <span className={styles.benefitIcon}>
            <GameIcon size={24} />
          </span>

          <div>
            <strong>Play Your Favorite Games</strong>
            <span>
              Fun games for every skill level
            </span>
          </div>
        </div>

        <div className={styles.benefitDivider} />

        <div className={styles.benefit}>
          <span className={styles.benefitIcon}>
            <CoinIcon size={24} />
          </span>

          <div>
            <strong>Earn Game Coins</strong>
            <span>
              The more you play, the more you earn
            </span>
          </div>
        </div>

        <div className={styles.benefitDivider} />

        <div className={styles.benefit}>
          <span className={styles.benefitIcon}>
            <GiftIcon size={24} />
          </span>

          <div>
            <strong>Redeem Real Rewards</strong>
            <span>
              Turn your coins into amazing rewards
            </span>
          </div>
        </div>

        <div className={styles.benefitTagline}>
          <strong>Good Games.</strong>
          <span>Greater Rewards.</span>
        </div>
      </section>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.footerLogo}>
            V
          </span>

          <div>
            <strong>VELOOP</strong>
            <span>REWARDS</span>
          </div>
        </div>

        <div className={styles.footerLinks}>
          <Link to="/games">Games</Link>
          <span>•</span>
          <Link to="/redeem">Redeem</Link>
          <span>•</span>
          <span>Repeat</span>
        </div>

        <div className={styles.footerRight}>
          <span>
            © 2026 VELOOP Rewards. All rights reserved.
          </span>

          <strong>
            Play. Earn. Redeem. Repeat.
          </strong>
        </div>
      </footer>
    </main>
  );
}

export default GamesPage;