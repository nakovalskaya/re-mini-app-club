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
          stroke="rgba(213, 173, 112, 0.85)"
          strokeWidth="1.2"
        />
      ))}
      <circle cx="24" cy="24" r="4.2" fill="#f0d2a2" />
    </svg>
  );
}
