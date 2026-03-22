export function AppLoadingFallback() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="app-loading-fallback"
      role="status"
    >
      <div className="app-loading-fallback__inner">
        <span className="app-loading-fallback__label">Loading</span>
        <span aria-hidden className="app-loading-fallback__dots">
          <span className="app-loading-fallback__dot" />
          <span className="app-loading-fallback__dot" />
          <span className="app-loading-fallback__dot" />
        </span>
      </div>
    </div>
  );
}
