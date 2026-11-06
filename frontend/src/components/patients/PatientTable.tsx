import { Eye, Pencil, Trash2 } from 'lucide-react';
import { ValidityBadge } from '@/components/ui/StatusBadge';
import { formatNumber } from '@/lib/format';
import type { PatientRecord } from '@/types/patient';

interface PatientTableProps {
  patients: PatientRecord[];
  onView: (patient: PatientRecord) => void;
  onEdit: (patient: PatientRecord) => void;
  onDelete: (patient: PatientRecord) => void;
}

const ICON_BUTTON =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2';

export default function PatientTable({ patients, onView, onEdit, onDelete }: PatientTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-5 py-3">Patient</th>
            <th scope="col" className="px-5 py-3">Date of birth</th>
            <th scope="col" className="px-5 py-3 text-right">Glucose</th>
            <th scope="col" className="px-5 py-3 text-right">Haemoglobin</th>
            <th scope="col" className="px-5 py-3 text-right">Cholesterol</th>
            <th scope="col" className="px-5 py-3">Status</th>
            <th scope="col" className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {patients.map((patient) => (
            <tr key={patient.id} className="transition hover:bg-blue-50/40">
              <td className="px-5 py-4">
                <p className="font-medium text-slate-900">{patient.full_name}</p>
                <p className="text-slate-500">{patient.email}</p>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-slate-700">{patient.date_of_birth}</td>
              <td className="px-5 py-4 text-right tabular-nums text-slate-700">{formatNumber(patient.glucose)}</td>
              <td className="px-5 py-4 text-right tabular-nums text-slate-700">{formatNumber(patient.haemoglobin)}</td>
              <td className="px-5 py-4 text-right tabular-nums text-slate-700">{formatNumber(patient.cholesterol)}</td>
              <td className="px-5 py-4">
                <ValidityBadge isValid={patient.is_valid} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" onClick={() => onView(patient)} aria-label={`View ${patient.full_name}`} className={`${ICON_BUTTON} hover:text-blue-700`}>
                    <Eye className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onEdit(patient)} aria-label={`Edit ${patient.full_name}`} className={`${ICON_BUTTON} hover:text-blue-700`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onDelete(patient)} aria-label={`Delete ${patient.full_name}`} className={`${ICON_BUTTON} hover:text-rose-600`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
