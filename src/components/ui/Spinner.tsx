interface SpinnerProps {
  size?: number;
}

export function Spinner({ size }: SpinnerProps) {
  return (
    <div
      className="ods-spinner"
      style={
        size
          ? { width: size, height: size, borderWidth: Math.max(2, Math.round(size / 12)) }
          : undefined
      }
    />
  );
}

interface PageLoaderProps {
  label?: string;
  /** Use inside a card/section instead of a full page — fixed padding instead of 60vh. */
  compact?: boolean;
}

export function PageLoader({ label = "Loading...", compact }: PageLoaderProps) {
  return (
    <div className={`ods-page-loader${compact ? " compact" : ""}`}>
      <Spinner />
      <p className="ods-page-loader-text">{label}</p>
    </div>
  );
}
