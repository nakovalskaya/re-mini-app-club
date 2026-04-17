type ProgressBarProps = {
  value: number;
  max: number;
};

export function ProgressBar({ value, max }: ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max;
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>Прогресс</span>
        <span>
          {safeValue} / {safeMax}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-soft">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent-gold transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
