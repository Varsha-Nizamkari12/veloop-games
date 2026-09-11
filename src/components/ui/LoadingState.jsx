import styles from "./LoadingState.module.css";

function LoadingState({
  message = "Loading your game..."
}) {
  return (
    <div
      className={styles.loadingState}
      role="status"
      aria-live="polite"
    >
      <div className={styles.loadingOrb}>
        <span />
        <span />
        <span />
      </div>

      <strong>{message}</strong>

      <p>Getting everything ready for you.</p>
    </div>
  );
}

export default LoadingState;