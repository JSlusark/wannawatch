"use client";

import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/catalogue", label: "Movie Catalogue" },
  { href: "/daily", label: "Today's WannaWatch" },
];

// Top bar of the app pages: logo (back to the landing page), main navigation, profile.
function SiteHeader() {
  const pathname = usePathname(); // the current URL path, e.g. "/daily"

  return (
    <header className="flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-3 sm:px-10">
      <Link
        href="/"
        aria-label="WannaWatch home"
        className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        <Logo />
      </Link>

      <nav aria-label="Main" className="flex-1">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {LINKS.map((link) => {
            const current = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  // Tells screen readers which page you're on
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-sm text-sm font-bold uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring",
                    // Plain text, no boxes and no lines. The current page is purple
                    // (a lighter purple in dark mode so it stays readable).
                    current
                      ? "text-secondary dark:text-purple-soft"
                      : "text-foreground hover:text-secondary dark:hover:text-purple-soft",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {/* Not built yet: shown so the menu matches the design, but not a link */}
          <li>
            <span
              aria-disabled="true"
              className="text-sm font-bold text-muted-foreground uppercase"
            >
              Advanced Search
            </span>
          </li>
        </ul>
      </nav>

      {/* Your profile page */}
      <Link
        href="/profile"
        aria-label="Profile"
        aria-current={pathname === "/profile" ? "page" : undefined}
        className="grid size-11 place-items-center rounded-full border-2 border-border bg-pink text-ink shadow-brutal-sm outline-none focus-visible:ring-3 focus-visible:ring-ring aria-[current=page]:bg-primary"
      >
        <CircleUserRound
          aria-hidden="true"
          className="size-7"
          strokeWidth={2}
        />
      </Link>
    </header>
  );
}

export { SiteHeader };
