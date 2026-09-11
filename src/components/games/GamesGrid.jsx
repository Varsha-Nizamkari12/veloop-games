import { useEffect, useRef, useState } from "react";

import games from "../../data/gameData.js";
import GameCard from "./GameCard";

import styles from "./GamesGrid.module.css";

const AUTO_SCROLL_MS = 3500;
const RESUME_AFTER_INTERACTION_MS = 5000;

function GamesGrid() {
  const carouselRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const getScrollStep = () => {
    const carousel = carouselRef.current;
    if (!carousel) return 304;

    const firstSlide = carousel.querySelector("[data-slide]");
    if (!firstSlide) return 304;

    const slideWidth = firstSlide.getBoundingClientRect().width;
    const carouselStyle = window.getComputedStyle(carousel);
    const gap = parseFloat(carouselStyle.columnGap) || 0;
    return slideWidth + gap;
  };

  const getCycleWidth = () => {
    const carousel = carouselRef.current;
    if (!carousel) return 0;
    return carousel.scrollWidth / 2;
  };

  const pauseForInteraction = () => {
    setIsPaused(true);
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      setIsPaused(false);
    }, RESUME_AFTER_INTERACTION_MS);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return undefined;

    const interval = window.setInterval(() => {
      if (isPaused || document.hidden) return;

      const step = getScrollStep();
      const cycleWidth = getCycleWidth();
      if (!step || !cycleWidth) return;

      const nextPosition = carousel.scrollLeft + step;

      if (nextPosition >= cycleWidth) {
        // The second half is an exact visual copy. Reset by one full cycle
        // without animation so the user never sees a seam or jump.
        carousel.scrollTo({
          left: carousel.scrollLeft - cycleWidth,
          behavior: "auto",
        });
        carousel.scrollBy({ left: step, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: step, behavior: "smooth" });
      }
    }, AUTO_SCROLL_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(resumeTimerRef.current);
    };
  }, [isPaused]);

  const handleScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const step = getScrollStep();
    if (!step) return;

    const cycleWidth = getCycleWidth();
    const cyclePosition = cycleWidth
      ? carousel.scrollLeft % cycleWidth
      : carousel.scrollLeft;
    const index = Math.round(cyclePosition / step) % games.length;

    setActiveDot(Math.min(Math.max(index, 0), games.length - 1));
  };

  const scrollToGame = (index) => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    pauseForInteraction();
    const step = getScrollStep();
    carousel.scrollTo({ left: index * step, behavior: "smooth" });
  };

  const renderedGames = [...games, ...games];

  return (
    <section className={styles.section} aria-label="VELOOP Games">
      <div
        ref={carouselRef}
        className={styles.carousel}
        onScroll={handleScroll}
        onPointerDown={pauseForInteraction}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={pauseForInteraction}
        role="region"
        aria-roledescription="carousel"
        aria-label="Game carousel"
        tabIndex={0}
      >
        {renderedGames.map((game, index) => (
          <div
            className={styles.slide}
            key={`${game.id}-${index}`}
            data-slide
            aria-hidden={index >= games.length ? "true" : undefined}
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>

      <div className={styles.dots} aria-label="Game carousel indicators">
        {games.map((game, index) => (
          <button
            key={game.id}
            type="button"
            className={`${styles.dot} ${activeDot === index ? styles.activeDot : ""}`}
            onClick={() => scrollToGame(index)}
            aria-label={`Go to ${game.name}`}
            aria-current={activeDot === index ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export default GamesGrid;
