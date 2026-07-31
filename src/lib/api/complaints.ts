/**
 * NETRONiX Complaint Portal — API Abstraction Layer
 *
 * All complaint-related API calls go through this module.
 * Currently uses the Next.js mock API routes.
 * To integrate FastAPI: replace BASE_URL and adjust the fetch calls below.
 *
 * FastAPI integration:
 *   const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
 */

const BASE_URL = '/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type IssueType = 'network' | 'wifi' | 'lan' | 'other';

export type ComplaintStatus =
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'resolved';

export interface ComplaintPayload {
  name: string;
  location: string; // room / block
  issueType: IssueType;
  description: string;
}

export interface ComplaintResponse {
  id: string;
  status: ComplaintStatus;
  createdAt: string;
  message: string;
}

export interface ComplaintStatusResponse {
  id: string;
  status: ComplaintStatus;
  updatedAt: string;
  estimatedResolution?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Submit a new complaint report.
 * FastAPI equivalent: POST /complaints
 */
export async function submitComplaint(
  data: ComplaintPayload
): Promise<ComplaintResponse> {
  const res = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Failed to submit complaint');
  }

  return res.json();
}

/**
 * Fetch the current status of a complaint by ID.
 * FastAPI equivalent: GET /complaints/{id}
 */
export async function getComplaintStatus(
  id: string
): Promise<ComplaintStatusResponse> {
  const res = await fetch(`${BASE_URL}/complaints/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch complaint status');
  }

  return res.json();
}
