export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
        <span className="absolute text-2xl animate-bounce">🧸</span>
      </div>
      <div className="space-y-1">
        <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
          Unpacking Toy Box...
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          Loading joyful child-safe toys and deals across Bangladesh.
        </p>
      </div>
    </div>
  );
}
