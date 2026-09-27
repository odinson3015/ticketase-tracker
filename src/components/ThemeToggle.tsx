"use client";

import { useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon } from "./icons";

/**
 * Which icon/label shows is decided purely by the `dark` class on <html>, which
 * is already set before the first paint. Doing it in CSS rather than from React
 * state keeps the server and client markup identical (no hydration mismatch).
 */
export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={withLabel ? "nav-link w-full" : "btn-icon"}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <MoonIcon className="h-4 w-4 dark:hidden" />
        <SunIcon className="hidden h-4 w-4 dark:block" />
      </span>
      {withLabel && (
        <>
          <span className="dark:hidden">Dark mode</span>
          <span className="hidden dark:inline">Light mode</span>
        </>
      )}
    </button>
  );
}
