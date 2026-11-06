import { ValidityBadge } from '@/components/ui/StatusBadge';
import { formatDateTime } from '@/lib/format';
import type { PatientRecord } from '@/types/patient';

export default function PatientRowSummary({ patient }: { patient: PatientRecord }) {
  return (
    <li className="flex flex-col gap-2 px-6 py-4 transition hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{patient.full_name}</p>
        <p className="truncate text-sm text-slate-500">{patient.email}</p>
      </div>
      <div className="flex items-center gap-3 sm:shrink-0">
        <span className="text-xs text-slate-500">Added {formatDateTime(patient.created_at)}</span>
        <ValidityBadge isValid={patient.is_valid} />
      </div>
    </li>
  );
}
