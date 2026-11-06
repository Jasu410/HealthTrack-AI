import { Search, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import DeletePatientDialog from '@/components/patients/DeletePatientDialog';
import EditPatientModal from '@/components/patients/EditPatientModal';
import PatientDetailModal from '@/components/patients/PatientDetailModal';
import PatientTable from '@/components/patients/PatientTable';
import Notice from '@/components/ui/Notice';
import { listPatients } from '@/lib/api';
import { errorMessage } from '@/lib/format';
import type { PatientRecord, ValidityFilter, ViewName } from '@/types/patient';

interface PatientsPageProps {
  onNavigate: (view: ViewName) => void;
}

const FILTERS: { value: ValidityFilter; label: string }[] = [
  { value: 'all', label: 'All records' },
  { value: 'valid', label: 'Valid' },
  { value: 'invalid', label: 'Invalid' },
];

type ActiveDialog =
  | { kind: 'view'; patient: PatientRecord }
  | { kind: 'edit'; patient: PatientRecord }
  | { kind: 'delete'; patient: PatientRecord }
  | null;

export default function PatientsPage({ onNavigate }: PatientsPageProps) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [validity, setValidity] = useState<ValidityFilter>('all');
  const [reloadKey, setReloadKey] = useState(0);
  const [dialog, setDialog] = useState<ActiveDialog>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setLoadError(null);
      listPatients(search, validity)
        .then((data) => {
          if (!cancelled) setPatients(data);
        })
        .catch((error: unknown) => {
          if (!cancelled) setLoadError(errorMessage(error, 'The patient records could not be loaded.'));
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, validity, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);
  const closeDialog = () => setDialog(null);
  const hasFilters = search.trim() !== '' || validity !== 'all';

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-blue-600">Patients</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">Patient records</h1>
        <p className="mt-2 text-sm text-slate-600">Search, review, edit or remove stored patient records.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full md:max-w-sm">
            <span className="sr-only">Search by name or email</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <div role="group" aria-label="Filter by validity" className="inline-flex w-full overflow-hidden rounded-lg border border-slate-300 bg-white text-sm md:w-auto">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setValidity(filter.value)}
                aria-pressed={validity === filter.value}
                className={`flex-1 px-4 py-2 font-medium transition md:flex-none ${
                  validity === filter.value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loadError && (
        <Notice tone="error">
          <span>{loadError} </span>
          <button type="button" onClick={reload} className="font-semibold underline">
            Try again
          </button>
        </Notice>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading && patients.length === 0 ? (
          <div className="space-y-3 p-6" aria-busy="true">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="font-medium text-slate-900">
              {hasFilters ? 'No records match your search' : 'No patient records yet'}
            </p>
            <p className="max-w-sm text-sm text-slate-500">
              {hasFilters ? 'Try a different name, email or filter.' : 'Add a patient to see their record here.'}
            </p>
            {!hasFilters && (
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Add patient
              </button>
            )}
          </div>
        ) : (
          <PatientTable
            patients={patients}
            onView={(patient) => setDialog({ kind: 'view', patient })}
            onEdit={(patient) => setDialog({ kind: 'edit', patient })}
            onDelete={(patient) => setDialog({ kind: 'delete', patient })}
          />
        )}
      </section>

      {dialog?.kind === 'view' && (
        <PatientDetailModal
          patient={dialog.patient}
          onClose={closeDialog}
          onEdit={() => setDialog({ kind: 'edit', patient: dialog.patient })}
          onDelete={() => setDialog({ kind: 'delete', patient: dialog.patient })}
        />
      )}
      {dialog?.kind === 'edit' && (
        <EditPatientModal
          patient={dialog.patient}
          onClose={closeDialog}
          onSaved={() => {
            closeDialog();
            reload();
          }}
        />
      )}
      {dialog?.kind === 'delete' && (
        <DeletePatientDialog
          patient={dialog.patient}
          onClose={closeDialog}
          onDeleted={() => {
            closeDialog();
            reload();
          }}
        />
      )}
    </div>
  );
}
