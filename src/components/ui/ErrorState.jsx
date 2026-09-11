import styles from "./ErrorState.module.css";

function ErrorState({
  message = "We couldn't start the game.",
  onRetry,
  onBack
}) {
  return (
    <div
      className={styles.errorState}
      role="alert"
    >
      <div className={styles.icon}>
        !
      </div>

      <span className={styles.label}>
        SOMETHING WENT WRONG
      </span>

      <h2>We hit a problem</h2>

      <p>{message}</p>

      <div className={styles.actions}>
        {onRetry && (
          <button
            type="button"
            className={styles.primary}
            onClick={onRetry}
          >
            Try Again
          </button>
        )}

        {onBack && (
          <button
            type="button"
            className={styles.secondary}
            onClick={onBack}
          >
            Back to Games
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorState;