"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SignOutButton } from "./SignOutButton";

const links = [
  { href: "/board", label: "Board" },
  { href: "/businesses", label: "Businesses" },
  { href: "/analytics", label: "Analytics" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/board" className="font-heading text-lg font-semibold text-ink">
            Tracker
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-light text-primary"
                      : "text-ink-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.name && (
            <span className="text-sm text-ink-muted">{session.user.name}</span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
