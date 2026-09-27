"use client";

import { useEffect } from "react";
import { CloseIcon } from "./icons";

/**
 * A panel that slides in from the right (a "side peek") instead of a centred
 * popup. Used for task and business details.
 */
export function SidePanel({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  // Close on Escape, and stop the page behind from scrolling.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xl animate-panel-in flex-col border-l border-line bg-surface shadow-panel">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-5 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {title}
          </span>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close panel">
            <CloseIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-line px-5 py-3">{footer}</div>
        )}
      </div>
    </div>
  );
}
