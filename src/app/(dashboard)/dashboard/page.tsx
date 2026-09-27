import Link from "next/link";
import { getServerSession } from "next-auth";
import { addDays, differenceInCalendarDays, format, isPast, isToday } from "date-fns";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priorityConfig, statusConfig } from "@/lib/labels";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Row = {
  key: string;
  name: string;
  total: number;
  done: number;
  inProgress: number;
  overdue: number;
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  const [tasks, users] = await Promise.all([
    prisma.task.findMany({
      include: { assignee: true, project: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const now = new Date();
  const weekAhead = addDays(now, 7);

  const isOverdue = (t: (typeof tasks)[number]) =>
    Boolean(t.dueDate) && t.status !== "DONE" && isPast(t.dueDate!) && !isToday(t.dueDate!);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdue = tasks.filter(isOverdue).length;
  const completionRate = total ? Math.round((done / total) * 100) : 0;

  // ---- Team progress -------------------------------------------------
  const rows: Row[] = users.map((u) => {
    const mine = tasks.filter((t) => t.assigneeId === u.id);
    return {
      key: u.id,
      name: u.name,
      total: mine.length,
      done: mine.filter((t) => t.status === "DONE").length,
      inProgress: mine.filter((t) => t.status === "IN_PROGRESS").length,
      overdue: mine.filter(isOverdue).length,
    };
  });

  const unassigned = tasks.filter((t) => !t.assigneeId);
  if (unassigned.length > 0) {
    rows.push({
      key: "unassigned",
      name: "Unassigned",
      total: unassigned.length,
      done: unassigned.filter((t) => t.status === "DONE").length,
      inProgress: unassigned.filter((t) => t.status === "IN_PROGRESS").length,
      overdue: unassigned.filter(isOverdue).length,
    });
  }

  // Most open (not yet done) tasks first.
  rows.sort((a, b) => b.total - b.done - (a.total - a.done));

  // ---- My tasks ------------------------------------------------------
  const myTasks = tasks
    .filter((t) => currentUserId && t.assigneeId === currentUserId && t.status !== "DONE")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });

  // ---- Upcoming this week -------------------------------------------
  const upcoming = tasks
    .filter(
      (t) => t.dueDate && t.status !== "DONE" && t.dueDate >= now && t.dueDate <= weekAhead
    )
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">
          {session?.user?.name ? "Hello, " + session.user.name.split(" ")[0] : "Dashboard"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {format(now, "EEEE, d MMMM yyyy")} · where the team stands today.
        </p>
      </div>

      {/* Stat row */}
      <div className="mb-10 grid grid-cols-2 gap-x-6 gap-y-5 border-b border-line pb-6 md:grid-cols-5">
        <Stat label="Total tasks" value={String(total)} />
        <Stat label="Completed" value={String(done)} />
        <Stat label="In progress" value={String(inProgress)} />
        <Stat label="Overdue" value={String(overdue)} emphasis={overdue > 0} />
        <Stat label="Completion" value={completionRate + "%"} />
      </div>

      {/* Team progress */}
      <section className="mb-10">
        <h2 className="section-title mb-3">Team progress</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-ink-faint">No team members yet.</p>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {rows.map((r) => {
              const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
              return (
                <div
                  key={r.key}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-2 sm:w-48">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chip text-[10px] font-medium text-ink-muted">
                      {r.key === "unassigned" ? "—" : initials(r.name)}
                    </span>
                    <span className="truncate text-sm font-medium text-ink">{r.name}</span>
                  </div>

                  <div className="flex-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-chip">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 text-xs text-ink-muted sm:w-64 sm:justify-end">
                    <span className="tabular-nums text-ink">
                      {r.done}/{r.total} done
                    </span>
                    {r.inProgress > 0 && <span>{r.inProgress} in progress</span>}
                    {r.overdue > 0 ? (
                      <span className="font-medium text-danger">{r.overdue} overdue</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* My tasks */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">My tasks</h2>
          <Link href="/board" className="text-xs text-primary-ink hover:underline">
            Open board
          </Link>
        </div>
        {myTasks.length === 0 ? (
          <p className="text-sm text-ink-faint">
            Nothing open assigned to you. Enjoy the quiet.
          </p>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {myTasks.map((t) => {
              const late = isOverdue(t);
              return (
                <div
                  key={t.id}
                  className={
                    "flex items-center justify-between gap-4 py-2.5 text-sm " +
                    (late ? "bg-danger-light/50 -mx-2 px-2 rounded-card" : "")
                  }
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{t.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={"pill " + statusConfig[t.status].pill}>
                        {statusConfig[t.status].label}
                      </span>
                      <span className={"pill " + priorityConfig[t.priority].pill}>
                        {priorityConfig[t.priority].label}
                      </span>
                      {t.project && <span className="pill pill-grey">{t.project.name}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    {t.dueDate ? (
                      <>
                        <p className={late ? "font-medium text-danger" : "text-ink-muted"}>
                          {format(t.dueDate, "MMM d")}
                        </p>
                        {late && (
                          <p className="mt-0.5 text-ink-faint">
                            {differenceInCalendarDays(now, t.dueDate)} day
                            {differenceInCalendarDays(now, t.dueDate) === 1 ? "" : "s"} late
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-ink-faint">No due date</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming this week */}
      <section>
        <h2 className="section-title mb-3">Upcoming this week</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-faint">Nothing due in the next 7 days.</p>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {upcoming.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{t.title}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {t.assignee?.name ?? "Unassigned"}
                    {t.project ? " · " + t.project.name : ""}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-ink-muted">
                  {format(t.dueDate!, "EEE d MMM")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p
        className={
          "mt-1 text-3xl font-semibold tracking-tight " +
          (emphasis ? "text-danger" : "text-ink")
        }
      >
        {value}
      </p>
    </div>
  );
}
