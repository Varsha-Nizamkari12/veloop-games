import { useEffect, useRef, useState } from "react";

import games from "../../data/gameData.js";
import GameCard from "./GameCard";

import styles from "./GamesGrid.module.css";

function GamesGrid() {
  const carouselRef = useRef(null);

  const [activeDot, setActiveDot] = useState(0);

  const getScrollStep = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return 304;
    }

    const firstSlide = carousel.querySelector("[data-slide]");

    if (!firstSlide) {
      return 304;
    }

    const slideWidth = firstSlide.getBoundingClientRect().width;

    const carouselStyle = window.getComputedStyle(carousel);

    const gap = parseFloat(carouselStyle.columnGap) || 0;

    return slideWidth + gap;
  };

  useEffect(() => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const interval = setInterval(() => {
      const step = getScrollStep();

      const maxScroll =
        carousel.scrollWidth - carousel.clientWidth;

      const nextPosition =
        carousel.scrollLeft + step;

      if (nextPosition >= maxScroll - 10) {
        carousel.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        carousel.scrollBy({
          left: step,
          behavior: "smooth",
        });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const step = getScrollStep();

    if (!step) {
      return;
    }

    const index = Math.round(
      carousel.scrollLeft / step
    );

    setActiveDot(
      Math.min(
        Math.max(index, 0),
        games.length - 1
      )
    );
  };

  const scrollToGame = (index) => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const step = getScrollStep();

    carousel.scrollTo({
      left: index * step,
      behavior: "smooth",
    });
  };

  return (
    <section
      className={styles.section}
      aria-label="VELOOP Games"
    >
      <div
        ref={carouselRef}
        className={styles.carousel}
        onScroll={handleScroll}
        role="region"
        aria-label="Game carousel"
        tabIndex="0"
      >
        {games.map((game) => (
          <div
            className={styles.slide}
            key={game.id}
            data-slide
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>

      <div
        className={styles.dots}
        aria-label="Game carousel indicators"
      >
        {games.map((game, index) => (
          <button
            key={game.id}
            type="button"
            className={`${styles.dot} ${
              activeDot === index
                ? styles.activeDot
                : ""
            }`}
            onClick={() =>
              scrollToGame(index)
            }
            aria-label={`Go to ${game.name}`}
            aria-current={
              activeDot === index
                ? "true"
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

export default GamesGrid;