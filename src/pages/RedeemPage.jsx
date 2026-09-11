import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext.jsx";

import gameCoinImage from "../assets/images/avif/veloop-avif-assets/images/game_coin.avif";
import gemsImage from "../assets/images/avif/veloop-avif-assets/images/multi_gems.avif";
import svesImage from "../assets/images/avif/veloop-avif-assets/images/multi_SVEs.avif";
import tokenImage from "../assets/images/avif/veloop-avif-assets/images/multi_token.avif";
import vesImage from "../assets/images/avif/veloop-avif-assets/images/multi_VEs.avif";
import spinImage from "../assets/images/avif/veloop-avif-assets/images/signle_spin.avif";

import styles from "./RedeemPage.module.css";

const rewards = [
  {
    id: "ves",
    name: "VEs",
    amount: 1,
    cost: 100,
    image: vesImage,
    description: "Redeem 1 VE.",
  },
  {
    id: "sves",
    name: "SVEs",
    amount: 1,
    cost: 100,
    image: svesImage,
    description: "Redeem 1 SVE.",
  },
  {
    id: "gems",
    name: "Gems",
    amount: 10,
    cost: 150,
    image: gemsImage,
    description: "Redeem 10 Gems.",
  },
  {
    id: "tokens",
    name: "Tokens",
    amount: 20,
    cost: 200,
    image: tokenImage,
    description: "Redeem 20 Tokens.",
  },
  {
    id: "spins",
    name: "Spins",
    amount: 1,
    cost: 250,
    image: spinImage,
    description: "Redeem 1 Spin.",
  },
];

function RedeemPage() {
  const navigate = useNavigate();

  const {
  gameCoins,
  spendGameCoins,
  addTokens,
} = useGame();
  const [selectedReward, setSelectedReward] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const [showHistory, setShowHistory] =
    useState(false);

  const [history, setHistory] =
    useState(() => {
      try {
        const saved = localStorage.getItem("veloop_redemption_history");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "veloop_redemption_history",
      JSON.stringify(history)
    );
  }, [history]);

  const handleSelectReward = (reward) => {
    setMessage("");
    setMessageType("");
    setSelectedReward(reward);
  };

  const closeModal = () => {
    setSelectedReward(null);
  };

  const handleRedeem = () => {
    if (!selectedReward) {
      return;
    }

    if (
      gameCoins <
      selectedReward.cost
    ) {
      setMessage(
        `You need ${selectedReward.cost} Game Coins, but you only have ${gameCoins}.`
      );

      setMessageType("error");

      return;
    }
    

    const success =
      spendGameCoins(
        selectedReward.cost
      );

    if (!success) {
      setMessage(
        "Unable to complete redemption."
      );

      setMessageType("error");

      return;
    }
    if (selectedReward.id === "tokens") {
  addTokens(selectedReward.amount);
}

    const newHistoryItem = {
      id: Date.now(),
      name: selectedReward.name,
      amount: selectedReward.amount,
      cost: selectedReward.cost,
      createdAt: new Date().toISOString(),
    };

    setHistory((current) => [
      newHistoryItem,
      ...current,
    ]);

    setSelectedReward(null);

    setMessage(
      `${selectedReward.amount} ${selectedReward.name} redeemed successfully!`
    );

    setMessageType("success");
  };

  return (
    <main className={styles.page}>
      <section className={styles.container}>

        {/* HEADER */}

        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              navigate("/games")
            }
            aria-label="Back to Games"
          >
            ←
          </button>

          <div className={styles.titleBlock}>
            <span className={styles.eyebrow}>
              VELOOP REWARDS
            </span>

            <h1>Redeem</h1>
          </div>

          <div className={styles.balance}>
            <img
              src={gameCoinImage}
              alt="Game Coins"
              className={styles.coinIcon}
            />

            <div>
              <strong>
                {gameCoins}
              </strong>

              <span>
                Game Coins
              </span>
            </div>
          </div>
        </header>

        {/* INTRO */}

        <section className={styles.intro}>
          <span className={styles.sectionLabel}>
            GAME COINS
          </span>

          <h2>
            Choose your reward
          </h2>

          <p>
            Use your Game Coins to
            redeem VELOOP rewards.
          </p>
        </section>

        {/* BALANCE CARD */}

        <section className={styles.balanceCard}>
          <div>
            <span>
              AVAILABLE BALANCE
            </span>

            <strong>
              {gameCoins}
            </strong>
          </div>

          <img
            src={gameCoinImage}
            alt=""
            className={styles.largeCoin}
          />
        </section>

        {/* REWARDS */}

        <section
          className={styles.grid}
          aria-label="Available rewards"
        >
          {rewards.map((reward) => {
            const canAfford =
              gameCoins >= reward.cost;

            return (
              <article
                key={reward.id}
                className={`${styles.card} ${
                  !canAfford
                    ? styles.unavailable
                    : ""
                }`}
              >
                <div
                  className={
                    styles.rewardImageWrapper
                  }
                >
                  <img
                    src={reward.image}
                    alt={`${reward.name} reward`}
                    className={
                      styles.rewardImage
                    }
                  />
                </div>

                <div
                  className={
                    styles.cardContent
                  }
                >
                  <span
                    className={
                      styles.rewardType
                    }
                  >
                    REWARD
                  </span>

                  <h3>
                    {reward.amount}{" "}
                    {reward.name}
                  </h3>

                  <p
                    className={
                      styles.description
                    }
                  >
                    {reward.description}
                  </p>

                  <div
                    className={
                      styles.cost
                    }
                  >
                    <img
                      src={gameCoinImage}
                      alt=""
                    />

                    <strong>
                      {reward.cost}
                    </strong>

                    <span>
                      Game Coins
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      canAfford
                        ? styles.redeemButton
                        : styles.disabledButton
                    }
                    onClick={() =>
                      handleSelectReward(
                        reward
                      )
                    }
                    disabled={!canAfford}
                    aria-label={
                      canAfford
                        ? `Redeem ${reward.amount} ${reward.name}`
                        : `Insufficient Game Coins for ${reward.name}`
                    }
                  >
                    {canAfford
                      ? "Redeem"
                      : "Insufficient Coins"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* MESSAGE */}

        {message && (
          <div
            className={`${styles.message} ${
              messageType === "success"
                ? styles.success
                : styles.error
            }`}
            role="status"
          >
            <span>
              {messageType === "success"
                ? "✓"
                : "!"}
            </span>

            <p>{message}</p>

            <button
              type="button"
              onClick={() => {
                setMessage("");
                setMessageType("");
              }}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* HISTORY */}

        <button
          type="button"
          className={styles.historyToggle}
          onClick={() =>
            setShowHistory(
              (current) => !current
            )
          }
        >
          <span>
            Redemption History
          </span>

          <span>
            {showHistory ? "−" : "+"}
          </span>
        </button>

        {showHistory && (
          <section
            className={styles.history}
            aria-label="Redemption history"
          >
            {history.length === 0 ? (
              <p>
                No redemptions yet.
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className={styles.historyItem}
                >
                  <div>
                    <strong>
                      {item.amount}{" "}
                      {item.name}
                    </strong>

                    <span>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <span>
                    −{item.cost} Coins
                  </span>
                </div>
              ))
            )}
          </section>
        )}
      </section>

      {/* CONFIRMATION MODAL */}

      {selectedReward && (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="redeem-title"
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Close redemption dialog"
            >
              ×
            </button>

            <span
              className={styles.modalLabel}
            >
              CONFIRM REDEMPTION
            </span>

            <div
              className={styles.modalReward}
            >
              <img
                src={
                  selectedReward.image
                }
                alt=""
              />
            </div>

            <h2 id="redeem-title">
              Redeem{" "}
              {selectedReward.amount}{" "}
              {selectedReward.name}?
            </h2>

            <p>
              This will use{" "}
              <strong>
                {selectedReward.cost}
              </strong>{" "}
              Game Coins from your
              balance.
            </p>

            <div
              className={
                styles.modalBalance
              }
            >
              <span>
                Current Balance
              </span>

              <strong>
                {gameCoins} Game Coins
              </strong>
            </div>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                className={
                  styles.primaryButton
                }
                onClick={
                  handleRedeem
                }
              >
                Confirm Redeem
              </button>

              <button
                type="button"
                className={
                  styles.secondaryButton
                }
                onClick={
                  closeModal
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}

      <nav
        className={styles.bottomNav}
        aria-label="Main navigation"
      >
        <button
          type="button"
          className={styles.navItem}
          onClick={() =>
            navigate("/games")
          }
        >
          <span>⌂</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`${styles.navItem} ${styles.active}`}
          aria-current="page"
        >
          <span>◇</span>
          <span>Redeem</span>
        </button>
      </nav>
    </main>
  );
}

export default RedeemPage;