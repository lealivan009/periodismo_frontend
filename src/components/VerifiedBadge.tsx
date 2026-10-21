export function VerifiedBadge() {
  return (
    <span className="verified-badge" title="Verificado">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" />
        <path
          d="M7 12.5 10.2 15.7 17 8.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Verificado</span>
    </span>
  );
}
