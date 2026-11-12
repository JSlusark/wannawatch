import { cn } from "@/lib/utils";

type LogoProps = {
  /** Show the "WannaWatch" word next to the eye */
  withText?: boolean;
  className?: string;
};

// The WannaWatch eye: lashes on top, a lime iris and a heart as the pupil.
// A simple hand-drawn SVG version; swap in the real exported logo when it's ready.
function Logo({ withText = true, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoEye className="h-9 w-auto shrink-0" />
      {withText && (
        <span className="font-display text-xl tracking-tight uppercase">
          WannaWatch
        </span>
      )}
    </span>
  );
}

// Just the eye. Decorative: the word "WannaWatch" (or a link label) names it.
function LogoEye({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 44"
      aria-hidden="true"
      className={cn("text-foreground", className)}
    >
      {/* Lashes */}
      <g
        className="stroke-current"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M32 4v6M20 6l2.5 6M44 6l-2.5 6M10 11l4 5M54 11l-4 5" />
      </g>
      {/* Eye outline (almond shape) */}
      <path
        d="M4 27C11 18 21 14 32 14s21 4 28 13c-7 9-17 13-28 13S11 36 4 27Z"
        className="fill-on-media stroke-current"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Iris */}
      <circle
        cx="32"
        cy="27"
        r="11"
        className="fill-primary stroke-current"
        strokeWidth="3"
      />
      {/* Heart pupil */}
      <path
        d="M32 33.5s-6-3.6-6-7.6a3.2 3.2 0 0 1 6-1.6 3.2 3.2 0 0 1 6 1.6c0 4-6 7.6-6 7.6Z"
        className="fill-current"
      />
    </svg>
  );
}

export { Logo, LogoEye };
