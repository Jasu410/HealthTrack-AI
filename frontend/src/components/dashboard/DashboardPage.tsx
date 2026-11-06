import { Activity, AlertCircle, CheckCircle2, ListChecks, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import PatientRowSummary from '@/components/dashboard/PatientRowSummary';
import StatCard from '@/components/ui/StatCard';
import Notice from '@/components/ui/Notice';
import { getDashboardSummary } from '@/lib/api';
import type { DashboardSummary, ViewName } from '@/types/patient';

interface DashboardPageProps {
  onNavigate: (view: ViewName) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'The dashboard could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const validShare = summary && summary.total_records > 0 ? Math.round((summary.valid_records / summary.total_records) * 100) : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Overview</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">A live summary of patient records stored in the database.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Add patient
        </button>
      </header>

      {loadError && (
        <Notice tone="error">
          <span>{loadError} </span>
          <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="font-semibold underline">
            Try again
          </button>
        </Notice>
      )}

      {isLoading && !summary && (
        <div className="grid gap-4 sm:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      )}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total patient records" value={summary.total_records} icon={ListChecks} tone="blue" />
            <StatCard label="Valid records" value={summary.valid_records} icon={CheckCircle2} tone="emerald" />
            <StatCard label="Invalid records" value={summary.invalid_records} icon={AlertCircle} tone="rose" />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Share of valid records</span>
              <span className="font-semibold text-blue-700">{validShare}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={validShare} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                style={{ width: `${validShare}%` }}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="font-semibold text-slate-900">Recently added patients</h2>
              </div>
              <button type="button" onClick={() => onNavigate('patients')} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View all
              </button>
            </div>
            {summary.recent_patients.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">No patients have been added yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {summary.recent_patients.map((patient) => (
                  <PatientRowSummary key={patient.id} patient={patient} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
