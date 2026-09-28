// Small decorative logos for the ratings row. Hidden from screen readers:
// the text next to them says "IMDb" / "Rotten Tomatoes" instead.

function ImdbIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-4 shrink-0">
      <rect width="32" height="32" rx="4" className="fill-imdb" />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        letterSpacing="-0.5"
      >
        IMDb
      </text>
    </svg>
  );
}

function TomatoIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-5 shrink-0">
      <circle cx="16" cy="18" r="12" className="fill-tomato" />
      <path
        d="M16 7c-2-3-6-3-8-2 2 0 4 1 5 3-3-1-6 0-7 2 3-1 6 0 8 1 1 0 3 0 4-1 2-1 5-2 8-1-1-2-4-3-7-2 1-2 3-3 5-3-2-1-6-1-8 3z"
        className="fill-tomato-leaf"
      />
    </svg>
  );
}

export { ImdbIcon, TomatoIcon };
