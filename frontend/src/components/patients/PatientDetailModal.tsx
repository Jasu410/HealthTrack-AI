import { CalendarDays, Mail, Pencil, Trash2 } from 'lucide-react';
import AiRemarksPanel from '@/components/patients/AiRemarksPanel';
import Modal from '@/components/ui/Modal';
import { ValidityBadge } from '@/components/ui/StatusBadge';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { PatientRecord } from '@/types/patient';

interface PatientDetailModalProps {
  patient: PatientRecord;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function Measure({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
        {formatNumber(value)} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </p>
    </div>
  );
}

export default function PatientDetailModal({ patient, onClose, onEdit, onDelete }: PatientDetailModalProps) {
  return (
    <Modal title="Patient details" onClose={onClose} maxWidthClass="max-w-3xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{patient.full_name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {patient.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                {patient.date_of_birth}
              </span>
            </div>
          </div>
          <ValidityBadge isValid={patient.is_valid} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Measure label="Glucose" value={patient.glucose} unit="mmol/L" />
          <Measure label="Haemoglobin" value={patient.haemoglobin} unit="g/dL" />
          <Measure label="Cholesterol" value={patient.cholesterol} unit="mmol/L" />
        </div>

        <AiRemarksPanel remarks={patient.ai_remarks} status={patient.ai_remarks_status} />

        <p className="text-xs text-slate-500">
          Added {formatDateTime(patient.created_at)} · Last updated {formatDateTime(patient.updated_at)}
        </p>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit details
          </button>
        </div>
      </div>
    </Modal>
  );
}
