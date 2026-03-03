export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="aspect-video skeleton" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="w-12 h-5 rounded skeleton" />
          <div className="w-16 h-5 rounded skeleton" />
        </div>
        <div className="w-full h-4 rounded skeleton" />
        <div className="w-3/4 h-4 rounded skeleton" />
        <div className="flex gap-1">
          <div className="w-12 h-4 rounded-full skeleton" />
          <div className="w-14 h-4 rounded-full skeleton" />
          <div className="w-10 h-4 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-surface)]">
      <div className="flex items-center gap-4">
        <div className="w-14 h-6 rounded skeleton" />
        <div className="flex-1 h-5 rounded skeleton" />
        <div className="w-20 h-6 rounded skeleton" />
      </div>
    </div>
  );
}
