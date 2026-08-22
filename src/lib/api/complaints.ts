/**
 * NETRONiX Complaint Portal — Client API Layer
 * Connects frontend components to persistent Next.js PostgreSQL endpoints.
 */

export type IssueType = "network" | "wifi" | "lan" | "other";

export type ComplaintStatus =
  | "reported"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected";

export interface ComplaintPayload {
  name: string;
  email: string;
  location: string; // room / block
  issueType: IssueType;
  description: string;
}

export interface ComplaintResponse {
  id: string;
  ticketId: string;
  status: ComplaintStatus;
  createdAt: string;
  message: string;
}

export interface ComplaintStatusResponse {
  ticketId: string;
  name: string;
  location: string;
  issueType: IssueType;
  description: string;
  status: ComplaintStatus;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

const BASE_URL = "/api";

/**
 * Submit a new complaint report.
 */
export async function submitComplaint(
  data: ComplaintPayload
): Promise<ComplaintResponse> {
  const res = await fetch(`${BASE_URL}/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body?.message || "Failed to submit complaint");
  }

  return body;
}

/**
 * Fetch the current status of a complaint by Ticket ID and verified Student Email.
 */
export async function getComplaintStatus(
  ticketId: string,
  email: string
): Promise<ComplaintStatusResponse> {
  const cleanId = ticketId.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  const url = `${BASE_URL}/complaints/${encodeURIComponent(cleanId)}?email=${encodeURIComponent(cleanEmail)}`;
  const res = await fetch(url, {
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body?.message || "Complaint not found or email does not match");
  }

  return body;
}
