interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <svg
      className={`brand-logo ${className}`.trim()}
      viewBox="0 0 76 56"
      aria-hidden="true"
      focusable="false"
    >
      <path className="brand-logo__stroke" d="M7 5v46M8 30 29 5M8 30l22 21" />
      <path className="brand-logo__stroke" d="m30 5 24 46M54 5 30 51" />
      <path className="brand-logo__accent" d="m60 15 9-10v46" />
    </svg>
  );
}
