type AtomIconProps = {
  className?: string;
};

const ORBIT_ROTATIONS = [0, 60, 120];

export function AtomIcon({ className }: AtomIconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {ORBIT_ROTATIONS.map((rotation) => (
        <ellipse
          key={rotation}
          transform={`rotate(${rotation} 24 24)`}
          cx="24"
          cy="24"
          rx="20"
          ry="8"
          fill="none"
          stroke="#feeac6"
          strokeWidth="0.9"
        />
      ))}
      <circle cx="24" cy="24" r="3.4" fill="#feeac6" />
    </svg>
  );
}
