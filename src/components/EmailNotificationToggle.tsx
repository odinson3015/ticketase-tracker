"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEmailNotifications } from "@/app/actions/settings";

export function EmailNotificationToggle({ initial }: { initial: boolean }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next); // optimistic
    startTransition(async () => {
      try {
        await setEmailNotifications(next);
        router.refresh();
      } catch {
        setEnabled(!next); // put it back if the save failed
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="Email me notifications"
      onClick={toggle}
      disabled={isPending}
      className={
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 " +
        (enabled ? "bg-primary" : "bg-chip")
      }
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: enabled ? "translateX(18px)" : "translateX(3px)" }}
      />
    </button>
  );
}
