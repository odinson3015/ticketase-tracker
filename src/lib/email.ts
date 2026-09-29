import { Resend } from "resend";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { priorityLabels } from "@/lib/labels";

/**
 * All notification email lives here.
 *
 * Nothing in this file is allowed to break a task saving: every exported
 * function swallows its own errors and just logs them. If RESEND_API_KEY is
 * not set, notifications are simply switched off.
 */

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM;

/** Live site, used for the links inside emails. No trailing slash. */
function appUrl() {
  const raw =
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "");
  return raw.replace(/\/+$/, "");
}

let client: Resend | null = null;
function resend() {
  if (!API_KEY) return null;
  if (!client) client = new Resend(API_KEY);
  return client;
}

export function emailEnabled() {
  return Boolean(API_KEY && FROM);
}

type Mail = { to: string; subject: string; html: string; text: string };

async function send({ to, subject, html, text }: Mail) {
  const api = resend();
  if (!api || !FROM) {
    console.info("[email] skipped (RESEND_API_KEY or EMAIL_FROM not set):", subject);
    return;
  }
  try {
    const { error } = await api.emails.send({ from: FROM, to, subject, html, text });
    if (error) {
      console.error("[email] Resend rejected the message:", error);
    }
  } catch (err) {
    console.error("[email] failed to send:", err);
  }
}

/* ------------------------------------------------------------------ */
/*  Templates                                                          */
/* ------------------------------------------------------------------ */

const INK = "#191919";
const MUTED = "#6B6B6B";
const LINE = "#E8E8E5";
const PRIMARY = "#3B3FA1";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** One "Label  Value" line in the property list. */
function propertyRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:6px 0;font-size:14px;color:${MUTED};width:120px;vertical-align:top;">${escapeHtml(
        label
      )}</td>
      <td style="padding:6px 0;font-size:14px;color:${INK};vertical-align:top;">${escapeHtml(
        value
      )}</td>
    </tr>`;
}

function button(label: string, href: string) {
  if (!href) return "";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
      <tr>
        <td style="background:${PRIMARY};border-radius:4px;">
          <a href="${href}" style="display:inline-block;padding:10px 18px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;">${escapeHtml(
            label
          )}</a>
        </td>
      </tr>
    </table>`;
}

/** Shared shell: white card, thin border, system font, good on phones. */
function layout({
  heading,
  preheader,
  body,
  cta,
}: {
  heading: string;
  /** Hidden line shown as the inbox preview beside the subject. */
  preheader: string;
  body: string;
  cta: string;
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f7f5;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f7f5;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border:1px solid ${LINE};border-radius:6px;">
            <tr>
              <td style="padding:24px 24px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <p style="margin:0;font-size:13px;font-weight:600;color:${PRIMARY};letter-spacing:0.03em;">TRACKER</p>
                <h1 style="margin:12px 0 0;font-size:20px;line-height:1.35;font-weight:600;color:${INK};">${escapeHtml(
                  heading
                )}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 24px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                ${body}
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 20px;border-top:1px solid ${LINE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#9B9A97;">
                  You are getting this because you are on the ReachOut / Ticketase team tracker.
                  Turn these emails off any time on the Settings page.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  Recipient lookup                                                   */
/* ------------------------------------------------------------------ */

/** Returns the recipient only if they exist and still want emails. */
async function recipient(userId: string | null | undefined) {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, emailNotifications: true },
  });
  if (!user || !user.emailNotifications || !user.email) return null;
  return user;
}

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

/**
 * A task was assigned to someone. Emails the assignee, never the person who
 * did the assigning.
 */
export async function notifyTaskAssigned({
  taskId,
  assigneeId,
  actorId,
}: {
  taskId: string;
  assigneeId: string;
  actorId: string;
}) {
  try {
    if (!emailEnabled()) return;
    if (assigneeId === actorId) return; // never email someone about their own action

    const [task, actor, to] = await Promise.all([
      prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      }),
      prisma.user.findUnique({ where: { id: actorId }, select: { name: true } }),
      recipient(assigneeId),
    ]);
    if (!task || !to) return;

    const actorName = actor?.name ?? "Someone";
    const url = appUrl();
    const boardLink = url ? url + "/board" : "";

    const rows = [
      propertyRow("Assigned by", actorName),
      propertyRow("Priority", priorityLabels[task.priority]),
      propertyRow(
        "Due date",
        task.dueDate ? format(new Date(task.dueDate), "EEEE d MMMM yyyy") : "No due date"
      ),
      propertyRow("Project", task.project?.name ?? "None"),
    ].join("");

    const description = task.description
      ? `<p style="margin:16px 0 0;padding:12px 14px;background:#f7f7f5;border-radius:4px;font-size:14px;line-height:1.55;color:${INK};white-space:pre-wrap;">${escapeHtml(
          task.description
        )}</p>`
      : "";

    const body = `
      <p style="margin:0 0 4px;font-size:16px;font-weight:600;line-height:1.4;color:${INK};">${escapeHtml(
        task.title
      )}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:12px;">
        ${rows}
      </table>
      ${description}`;

    const textLines = [
      `${actorName} assigned you a task on the team tracker.`,
      "",
      task.title,
      "",
      `Assigned by: ${actorName}`,
      `Priority: ${priorityLabels[task.priority]}`,
      `Due date: ${
        task.dueDate ? format(new Date(task.dueDate), "EEEE d MMMM yyyy") : "No due date"
      }`,
      `Project: ${task.project?.name ?? "None"}`,
    ];
    if (task.description) textLines.push("", task.description);
    if (boardLink) textLines.push("", `Open the board: ${boardLink}`);
    textLines.push(
      "",
      "You can turn these emails off on the Settings page in the tracker."
    );

    await send({
      to: to.email,
      subject: `${actorName} assigned you: ${task.title}`,
      html: layout({
        heading: actorName + " assigned you a task",
        preheader: task.title,
        body,
        cta: button("Open the board", boardLink),
      }),
      text: textLines.join("\n"),
    });
  } catch (err) {
    console.error("[email] notifyTaskAssigned failed:", err);
  }
}

/**
 * A task was moved to Done. Emails whoever created the task, never the person
 * who completed it.
 */
export async function notifyTaskCompleted({
  taskId,
  actorId,
}: {
  taskId: string;
  actorId: string;
}) {
  try {
    if (!emailEnabled()) return;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) return;
    if (task.createdById === actorId) return; // don't email your own completion

    const [actor, to] = await Promise.all([
      prisma.user.findUnique({ where: { id: actorId }, select: { name: true } }),
      recipient(task.createdById),
    ]);
    if (!to) return;

    const actorName = actor?.name ?? "Someone";
    const url = appUrl();
    const boardLink = url ? url + "/board" : "";

    const body = `
      <p style="margin:0 0 4px;font-size:16px;font-weight:600;line-height:1.4;color:${INK};">${escapeHtml(
        task.title
      )}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:12px;">
        ${propertyRow("Completed by", actorName)}
        ${propertyRow("Project", task.project?.name ?? "None")}
      </table>`;

    const textLines = [
      `${actorName} marked a task you created as done.`,
      "",
      task.title,
      "",
      `Completed by: ${actorName}`,
      `Project: ${task.project?.name ?? "None"}`,
    ];
    if (boardLink) textLines.push("", `Open the board: ${boardLink}`);
    textLines.push(
      "",
      "You can turn these emails off on the Settings page in the tracker."
    );

    await send({
      to: to.email,
      subject: `Done: ${task.title}`,
      html: layout({
        heading: actorName + " completed a task you created",
        preheader: task.title,
        body,
        cta: button("Open the board", boardLink),
      }),
      text: textLines.join("\n"),
    });
  } catch (err) {
    console.error("[email] notifyTaskCompleted failed:", err);
  }
}
