export function AppLoadingFallback() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-5 flex items-center justify-center bg-ink-950"
      role="status"
    >
      <div className="flex items-center gap-2 font-['Outfit',system-ui,sans-serif] text-sm font-medium tracking-[0.16em] text-ivory-50/80 uppercase">
        <span>Loading</span>
        <span aria-hidden className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-ivory-50/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-ivory-50/45" />
          <span className="h-1.5 w-1.5 rounded-full bg-ivory-50/25" />
        </span>
      </div>
    </div>
  );
}
