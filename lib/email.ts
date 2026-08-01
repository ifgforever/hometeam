import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTaskAssignmentEmail({
  toEmail,
  toName,
  familyName,
  taskTitle,
  taskDescription,
  taskCategory,
  taskPoints,
  taskPriority,
  assignedBy,
}: {
  toEmail: string;
  toName: string;
  familyName: string;
  taskTitle: string;
  taskDescription?: string;
  taskCategory: string;
  taskPoints: number;
  taskPriority: string;
  assignedBy: string;
}) {
  const isUrgent = taskPriority === 'high';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin:0; padding:0; background:#f5f5f5; }
        .container { max-width:520px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; }
        .header { background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:32px; text-align:center; }
        .header h1 { color:white; margin:0; font-size:24px; font-weight:900; letter-spacing:-0.5px; }
        .header p { color:#c4b5fd; margin:6px 0 0; font-size:14px; }
        .urgent-banner { background:#ef4444; color:white; text-align:center; padding:10px; font-weight:bold; font-size:14px; }
        .body { padding:32px; }
        .greeting { font-size:18px; font-weight:700; color:#1e1b4b; margin-bottom:4px; }
        .sub { color:#6b7280; font-size:14px; margin-bottom:24px; }
        .task-card { background:#f5f3ff; border:2px solid #7c3aed; border-radius:12px; padding:20px; margin-bottom:24px; }
        .task-title { font-size:20px; font-weight:900; color:#1e1b4b; margin:0 0 8px; }
        .task-desc { color:#6b7280; font-size:14px; margin:0 0 16px; }
        .task-meta { display:flex; gap:12px; flex-wrap:wrap; }
        .badge { display:inline-block; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:700; }
        .badge-cat { background:#ede9fe; color:#6d28d9; }
        .badge-pts { background:#fef3c7; color:#92400e; }
        .badge-urgent { background:#fee2e2; color:#991b1b; }
        .cta { background:#4f46e5; color:white; padding:16px 24px; border-radius:12px; text-align:center; font-weight:700; font-size:16px; text-decoration:none; display:block; }
        .footer { padding:24px 32px; text-align:center; color:#9ca3af; font-size:12px; border-top:1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="container">
        ${isUrgent ? '<div class="urgent-banner">🚨 URGENT TASK — Needs immediate attention</div>' : ''}
        <div class="header">
          <h1>🏠 HomeTeam</h1>
          <p>${familyName}</p>
        </div>
        <div class="body">
          <p class="greeting">Hey ${toName}! 👋</p>
          <p class="sub">You've been randomly selected for a task that needs attention right now.</p>

          <div class="task-card">
            <h2 class="task-title">${taskTitle}</h2>
            ${taskDescription ? `<p class="task-desc">${taskDescription}</p>` : ''}
            <div class="task-meta">
              <span class="badge badge-cat">${taskCategory}</span>
              <span class="badge badge-pts">+${taskPoints} pts</span>
              ${isUrgent ? '<span class="badge badge-urgent">🚨 Urgent</span>' : ''}
            </div>
          </div>

          <p style="color:#374151;font-size:14px;margin-bottom:24px;">
            Assigned by <strong>${assignedBy}</strong>. Complete it in the app to earn your points!
          </p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="cta">
            Open HomeTeam → Complete Task
          </a>
        </div>
        <div class="footer">
          <p>HomeTeam — Keeping the ${familyName} running strong 💪</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"HomeTeam" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `${isUrgent ? '🚨 URGENT: ' : '📋 New task for you: '}"${taskTitle}" (+${taskPoints} pts)`,
    html,
  });
}
