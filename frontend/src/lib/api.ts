import type {
  AssessmentResults,
  DashboardSummary,
  PatientFormValues,
  PatientRecord,
  ValidityFilter,
} from '@/types/patient';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
  } catch {
    throw new ApiError('The HealthTrack server could not be reached. Check that the backend is running.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const record = (body ?? {}) as { message?: unknown; detail?: unknown; errors?: unknown };
    const message =
      typeof record.message === 'string'
        ? record.message
        : typeof record.detail === 'string'
          ? record.detail
          : `The request failed (HTTP ${response.status}).`;
    const fieldErrors =
      record.errors && typeof record.errors === 'object' ? (record.errors as Record<string, string>) : {};
    throw new ApiError(message, response.status, fieldErrors);
  }
  return body as T;
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>('/api/dashboard/summary');
}

export function listPatients(search: string, validity: ValidityFilter): Promise<PatientRecord[]> {
  const params = new URLSearchParams({ validity });
  if (search.trim()) {
    params.set('search', search.trim());
  }
  return request<PatientRecord[]>(`/api/patients?${params.toString()}`);
}

export function createPatient(values: PatientFormValues): Promise<PatientRecord> {
  return request<PatientRecord>('/api/patients', { method: 'POST', body: JSON.stringify(values) });
}

export function updatePatient(id: number, values: PatientFormValues): Promise<PatientRecord> {
  return request<PatientRecord>(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(values) });
}

export function deletePatient(id: number): Promise<void> {
  return request<void>(`/api/patients/${id}`, { method: 'DELETE' });
}

export function getAssessmentResults(): Promise<AssessmentResults> {
  return request<AssessmentResults>('/api/assessment/results');
}

export function importAssessmentRecords(records: unknown[]): Promise<AssessmentResults> {
  return request<AssessmentResults>('/api/assessment/import', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
}
