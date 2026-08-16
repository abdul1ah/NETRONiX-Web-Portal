import { Resend } from "resend";
import { ComplaintStatus, IssueType } from "@prisma/client";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The sender email configured in Resend (e.g., "NETRONiX Portal <onboarding@resend.dev>" or "support@netronix.giki.edu.pk")
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "NETRONiX Support <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  REPORTED: "Reported",
  ASSIGNED: "Assigned to Engineer",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

const ISSUE_LABELS: Record<IssueType, string> = {
  NETWORK: "Network / General",
  WIFI: "Campus WiFi",
  LAN: "LAN / Ethernet Port",
  OTHER: "Other Technical Issue",
};

function getEmailWrapper(contentHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NETRONiX Network Portal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050505; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0F0F0F; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: left;">
              <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #FFFFFF;">
                NETRON<span style="color: #E11D2E;">iX</span>
              </span>
              <p style="margin: 4px 0 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 0.1em; font-family: monospace;">
                GIKI Digital Infrastructure Portal
              </p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px; text-align: left; line-height: 1.6; font-size: 15px; color: #CCCCCC;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: left; font-size: 12px; color: #666666; font-family: monospace;">
              <p style="margin: 0 0 6px;">NETRONiX — Ghulam Ishaq Khan Institute of Engineering Sciences and Technology</p>
              <p style="margin: 0;">This is an automated notification. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * 1. Send confirmation email when a complaint is submitted
 */
export async function sendComplaintConfirmationEmail(params: {
  to: string;
  studentName: string;
  ticketId: string;
  location: string;
  issueType: IssueType;
  description: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("Resend API key not configured. Skipping confirmation email to:", params.to);
    return { success: false, error: "Resend not configured" };
  }

  const trackLink = `${APP_URL}/#portal`;

  const htmlContent = `
    <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0; font-weight: 600;">Issue Report Received</h2>
    <p>Hello <strong style="color: #FFFFFF;">${params.studentName}</strong>,</p>
    <p>Your network issue report has been logged in our operations queue. Our engineering team has been notified and will investigate the issue.</p>
    
    <div style="background-color: #161616; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 20px; margin: 24px 0;">
      <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px;">
        <tr>
          <td style="color: #888888; width: 140px; font-family: monospace;">Ticket ID:</td>
          <td style="color: #E11D2E; font-weight: bold; font-family: monospace; font-size: 16px;">${params.ticketId}</td>
        </tr>
        <tr>
          <td style="color: #888888; font-family: monospace;">Status:</td>
          <td style="color: #FFFFFF; font-weight: 500;">Reported</td>
        </tr>
        <tr>
          <td style="color: #888888; font-family: monospace;">Issue Category:</td>
          <td style="color: #FFFFFF;">${ISSUE_LABELS[params.issueType]}</td>
        </tr>
        <tr>
          <td style="color: #888888; font-family: monospace;">Room / Block:</td>
          <td style="color: #FFFFFF;">${params.location}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #999999;">
      <strong>How to track your ticket:</strong><br>
      Visit the <a href="${trackLink}" style="color: #E11D2E; text-decoration: underline;">NETRONiX Complaint Portal</a>, select <em>"Track Ticket"</em>, and enter your <strong>Ticket ID (${params.ticketId})</strong> along with your registered email address (<strong>${params.to}</strong>).
    </p>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `[${params.ticketId}] Issue Report Received — NETRONiX Network Operations`,
      html: getEmailWrapper(htmlContent),
      text: `Hello ${params.studentName},\n\nYour issue report (${params.ticketId}) has been received.\nLocation: ${params.location}\nIssue: ${ISSUE_LABELS[params.issueType]}\nStatus: Reported\n\nYou can track your ticket at ${trackLink} using your Ticket ID and email.\n\nNETRONiX Operations`,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send complaint confirmation email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}

/**
 * 2. Send status update email (Assigned, In Progress, Rejected)
 */
export async function sendComplaintStatusUpdateEmail(params: {
  to: string;
  studentName: string;
  ticketId: string;
  status: ComplaintStatus;
  adminResponse?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("Resend API key not configured. Skipping status update email to:", params.to);
    return { success: false, error: "Resend not configured" };
  }

  const trackLink = `${APP_URL}/#portal`;
  const statusLabel = STATUS_LABELS[params.status];

  const htmlContent = `
    <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0; font-weight: 600;">Status Update: ${statusLabel}</h2>
    <p>Hello <strong style="color: #FFFFFF;">${params.studentName}</strong>,</p>
    <p>The status of your ticket <strong style="color: #E11D2E; font-family: monospace;">${params.ticketId}</strong> has been updated to: <strong style="color: #FFFFFF;">${statusLabel}</strong>.</p>
    
    ${
      params.adminResponse
        ? `
      <div style="background-color: #161616; border-left: 3px solid #E11D2E; border-radius: 4px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px; font-size: 12px; color: #888888; text-transform: uppercase; font-family: monospace;">Note from Network Team:</p>
        <p style="margin: 0; color: #EEEEEE; font-size: 14px;">${params.adminResponse}</p>
      </div>
      `
        : ""
    }

    <p style="font-size: 14px; color: #999999; margin-top: 24px;">
      You can track the live progress at the <a href="${trackLink}" style="color: #E11D2E; text-decoration: underline;">NETRONiX Portal</a>.
    </p>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `[${params.ticketId}] Status Update: ${statusLabel} — NETRONiX`,
      html: getEmailWrapper(htmlContent),
      text: `Hello ${params.studentName},\n\nYour ticket ${params.ticketId} status has been updated to: ${statusLabel}.${
        params.adminResponse ? `\n\nNote: ${params.adminResponse}` : ""
      }\n\nTrack progress at: ${trackLink}\n\nNETRONiX Operations`,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send status update email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}

/**
 * 3. Send resolution email when complaint is resolved
 */
export async function sendComplaintResolvedEmail(params: {
  to: string;
  studentName: string;
  ticketId: string;
  adminResponse?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("Resend API key not configured. Skipping resolution email to:", params.to);
    return { success: false, error: "Resend not configured" };
  }

  const trackLink = `${APP_URL}/#portal`;

  const htmlContent = `
    <h2 style="color: #4ade80; font-size: 20px; margin-top: 0; font-weight: 600;">✓ Issue Marked as Resolved</h2>
    <p>Hello <strong style="color: #FFFFFF;">${params.studentName}</strong>,</p>
    <p>Your reported network issue (<strong style="color: #E11D2E; font-family: monospace;">${params.ticketId}</strong>) has been successfully resolved by the NETRONiX engineering team.</p>
    
    ${
      params.adminResponse
        ? `
      <div style="background-color: #161616; border-left: 3px solid #4ade80; border-radius: 4px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 6px; font-size: 12px; color: #888888; text-transform: uppercase; font-family: monospace;">Resolution Summary:</p>
        <p style="margin: 0; color: #EEEEEE; font-size: 14px;">${params.adminResponse}</p>
      </div>
      `
        : ""
    }

    <p style="font-size: 14px; color: #999999; margin-top: 24px;">
      If you are still experiencing connectivity issues, please feel free to submit a new report on the <a href="${trackLink}" style="color: #E11D2E; text-decoration: underline;">NETRONiX Portal</a>.
    </p>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `[${params.ticketId}] Issue Resolved — NETRONiX Network Operations`,
      html: getEmailWrapper(htmlContent),
      text: `Hello ${params.studentName},\n\nYour ticket ${params.ticketId} has been resolved.${
        params.adminResponse ? `\n\nResolution: ${params.adminResponse}` : ""
      }\n\nThank you for reaching out to NETRONiX Operations.`,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send resolution email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown email error" };
  }
}
