/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const GameContext = createContext(null);

const INITIAL_TOKENS = 100;
const INITIAL_GAME_COINS = 1000;

function GameProvider({ children }) {
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem("veloop_tokens");

    return savedTokens !== null
      ? Number(savedTokens)
      : INITIAL_TOKENS;
  });

  const [gameCoins, setGameCoins] = useState(() => {
    const savedCoins = localStorage.getItem("veloop_game_coins");

    return savedCoins !== null
      ? Number(savedCoins)
      : INITIAL_GAME_COINS;
  });

  useEffect(() => {
    localStorage.setItem("veloop_tokens", tokens);
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem("veloop_game_coins", gameCoins);
  }, [gameCoins]);

  const hasEnoughTokens = (amount = 20) => {
    return tokens >= amount;
  };

  const deductTokens = (amount = 20) => {
    if (tokens < amount) {
      return false;
    }

    setTokens((currentTokens) => currentTokens - amount);

    return true;
  };

  const addTokens = (amount) => {
    setTokens((currentTokens) => currentTokens + amount);
  };

  const addGameCoins = (amount) => {
    setGameCoins((currentCoins) => currentCoins + amount);
  };

  const spendGameCoins = (amount) => {
    if (gameCoins < amount) {
      return false;
    }

    setGameCoins((currentCoins) => currentCoins - amount);

    return true;
  };

  const value = {
    tokens,
    gameCoins,
    hasEnoughTokens,
    deductTokens,
    addTokens,
    addGameCoins,
    spendGameCoins,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}

export { GameProvider, useGame };
