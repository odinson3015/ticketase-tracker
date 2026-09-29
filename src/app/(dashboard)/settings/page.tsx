import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailEnabled } from "@/lib/email";
import { EmailNotificationToggle } from "@/components/EmailNotificationToggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, emailNotifications: true },
  });
  if (!user) redirect("/login");

  const sendingOn = emailEnabled();

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Your account and notifications.</p>
      </div>

      <section className="mb-10">
        <h2 className="section-title mb-3">Account</h2>
        <div className="divide-y divide-line border-t border-line">
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm text-ink-muted">Name</span>
            <span className="text-sm text-ink">{user.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm text-ink-muted">Email</span>
            <span className="truncate text-sm text-ink">{user.email}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">Notifications</h2>
        <div className="border-t border-line">
          <div className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">Email me notifications</p>
              <p className="mt-1 text-sm text-ink-muted">
                Get an email when someone assigns you a task, and when someone finishes a
                task you created. We never email you about your own actions.
              </p>
            </div>
            <EmailNotificationToggle initial={user.emailNotifications} />
          </div>
        </div>

        {!sendingOn && (
          <p className="mt-3 rounded-card bg-accent-light px-3 py-2 text-sm text-accent">
            Email sending is not switched on for this site yet, so no emails will go out
            even with this turned on.
          </p>
        )}
      </section>
    </div>
  );
}
