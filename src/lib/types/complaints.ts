import { ComplaintStatus, IssueType, Role } from "@prisma/client";

export { ComplaintStatus, IssueType, Role };

export const VALID_STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  REPORTED: ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "RESOLVED", "REJECTED", "REPORTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED", "ASSIGNED"],
  RESOLVED: ["IN_PROGRESS"], // Allowed to reopen if issue recurs
  REJECTED: ["REPORTED"],    // Allowed to reopen for re-evaluation
};

export function isValidStatusTransition(
  from: ComplaintStatus,
  to: ComplaintStatus
): boolean {
  if (from === to) return true;
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface StudentComplaintResponse {
  ticketId: string;
  name: string;
  location: string;
  issueType: IssueType;
  description: string;
  status: ComplaintStatus;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}
