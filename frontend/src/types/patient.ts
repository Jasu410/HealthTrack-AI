export type ValidityFilter = 'all' | 'valid' | 'invalid';

export type ViewName = 'dashboard' | 'patients' | 'register' | 'assessment';

export interface PatientRecord {
  id: number;
  full_name: string;
  date_of_birth: string;
  email: string;
  glucose: number;
  haemoglobin: number;
  cholesterol: number;
  ai_remarks: string | null;
  ai_remarks_status: 'generated' | 'unavailable';
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientFormValues {
  full_name: string;
  date_of_birth: string;
  email: string;
  glucose: string;
  haemoglobin: string;
  cholesterol: string;
}

export const EMPTY_PATIENT_FORM: PatientFormValues = {
  full_name: '',
  date_of_birth: '',
  email: '',
  glucose: '',
  haemoglobin: '',
  cholesterol: '',
};

export interface DashboardSummary {
  total_records: number;
  valid_records: number;
  invalid_records: number;
  recent_patients: PatientRecord[];
}

export type AssessmentStatus = 'accepted' | 'rejected' | 'duplicate';

export interface AssessmentEntry {
  record_number: number;
  status: AssessmentStatus;
  patient_id: number | null;
  duplicate_of: number | null;
  original_values: unknown;
  reasons: string[];
  created_at: string;
}

export interface AssessmentResults {
  summary: {
    total: number;
    accepted: number;
    rejected: number;
    duplicates: number;
  };
  entries: AssessmentEntry[];
}
