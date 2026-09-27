"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { createProject } from "@/app/actions/projects";
import { ProjectOption } from "@/types";
import { ThemeToggle } from "./ThemeToggle";
import {
  BoardIcon,
  BriefcaseIcon,
  ChartIcon,
  CloseIcon,
  HashIcon,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
} from "./icons";

const links = [
  { href: "/dashboard", label: "Dashboard", Icon: HomeIcon },
  { href: "/board", label: "Board", Icon: BoardIcon },
  { href: "/businesses", label: "Businesses", Icon: BriefcaseIcon },
  { href: "/analytics", label: "Analytics", Icon: ChartIcon },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar({ projects }: { projects: ProjectOption[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, startTransition] = useTransition();

  const activeProject = searchParams.get("project");

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, searchParams]);

  // Let Escape close the drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  function handleNewProject() {
    const name = window.prompt("Project or event name (e.g. HCD 2026):");
    if (!name || !name.trim()) return;
    const formData = new FormData();
    formData.set("name", name.trim());
    startTransition(async () => {
      await createProject(formData);
      router.refresh();
    });
  }

  const nav = (
    <div className="flex h-full flex-col">
      {/* App name */}
      <div className="flex items-center justify-between px-3 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-card px-1 py-1 text-sm font-semibold text-ink transition-colors hover:bg-hover"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-card bg-primary text-[11px] font-semibold text-primary-fg">
            T
          </span>
          Tracker
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="btn-icon md:hidden"
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="space-y-0.5 px-2">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${active ? "nav-link-active" : ""}`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-primary-ink" : "text-ink-faint"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Projects */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col px-2">
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Projects
          </span>
          <button
            type="button"
            onClick={handleNewProject}
            className="btn-icon h-5 w-5"
            aria-label="New project"
            title="New project"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          <Link
            href="/board"
            className={`nav-link ${
              pathname === "/board" && !activeProject ? "nav-link-active" : ""
            }`}
          >
            <HashIcon className="h-4 w-4 text-ink-faint" />
            All tasks
          </Link>
          {projects.map((p) => {
            const active = pathname === "/board" && activeProject === p.id;
            return (
              <Link
                key={p.id}
                href={`/board?project=${p.id}`}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
                title={p.name}
              >
                <HashIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                <span className="truncate">{p.name}</span>
              </Link>
            );
          })}
          {projects.length === 0 && (
            <p className="px-2 py-1 text-xs text-ink-faint">No projects yet.</p>
          )}
        </div>
      </div>

      {/* Footer: user, theme, sign out */}
      <div className="mt-2 space-y-0.5 border-t border-line px-2 py-2">
        <ThemeToggle withLabel />
        <div className="flex items-center gap-2 rounded-card px-2 py-1.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chip text-[10px] font-medium text-ink-muted">
            {session?.user?.name ? initials(session.user.name) : "?"}
          </span>
          <span className="truncate text-sm text-ink-muted">
            {session?.user?.name ?? "Signed in"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="nav-link w-full"
        >
          <LogoutIcon className="h-4 w-4 text-ink-faint" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-bg px-3 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="btn-icon"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <span className="text-sm font-semibold text-ink">Tracker</span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-line bg-subtle">
            {nav}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-line bg-subtle md:block">
        {nav}
      </aside>
    </>
  );
}
