"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-ink-muted transition-colors hover:text-ink"
    >
      Sign out
    </button>
  );
}
