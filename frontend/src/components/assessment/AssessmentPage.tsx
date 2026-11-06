import { ClipboardList, FileUp, Loader2 } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import Notice from '@/components/ui/Notice';
import { AssessmentStatusBadge } from '@/components/ui/StatusBadge';
import { ApiError, getAssessmentResults, importAssessmentRecords } from '@/lib/api';
import { errorMessage } from '@/lib/format';
import type { AssessmentEntry, AssessmentResults } from '@/types/patient';

function readField(values: unknown, key: string): string {
  if (values && typeof values === 'object' && key in values) {
    const value = (values as Record<string, unknown>)[key];
    return value === null || value === undefined || value === '' ? '-' : String(value);
  }
  return '-';
}

function parseRecordsFile(text: string): unknown[] {
  const parsed: unknown = JSON.parse(text);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { records?: unknown }).records)) {
    return (parsed as { records: unknown[] }).records;
  }
  throw new Error('The file must contain a list of patient records.');
}

function SummaryCard({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${className}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function EntryRow({ entry }: { entry: AssessmentEntry }) {
  const isDuplicate = entry.status === 'duplicate';
  const isRejected = entry.status === 'rejected';
  const rowTone = isDuplicate ? 'bg-amber-50/70' : isRejected ? 'bg-rose-50/50' : 'bg-white';
  return (
    <tr className={`align-top ${rowTone}`}>
      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">#{entry.record_number}</td>
      <td className="px-5 py-4">
        <AssessmentStatusBadge status={entry.status} />
      </td>
      <td className="px-5 py-4">
        <p className="font-medium text-slate-900">{readField(entry.original_values, 'full_name')}</p>
        <p className="text-sm text-slate-500">
          {readField(entry.original_values, 'email')} · DOB {readField(entry.original_values, 'date_of_birth')}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Glucose {readField(entry.original_values, 'glucose')} · Haemoglobin{' '}
          {readField(entry.original_values, 'haemoglobin')} · Cholesterol {readField(entry.original_values, 'cholesterol')}
        </p>
      </td>
      <td className="px-5 py-4 text-sm text-slate-700">
        <ul className="list-disc space-y-1 pl-4">
          {entry.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        {isDuplicate && (
          <p className="mt-2 font-medium text-amber-800">
            Flagged as a duplicate of {entry.duplicate_of ? `patient record ${entry.duplicate_of}` : 'an existing record'}. It is kept in this log and not saved twice.
          </p>
        )}
        {entry.patient_id !== null && (
          <p className="mt-2 text-xs text-slate-500">Saved as patient record {entry.patient_id}</p>
        )}
      </td>
    </tr>
  );
}

export default function AssessmentPage() {
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingRecords, setPendingRecords] = useState<unknown[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAssessmentResults()
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(errorMessage(error, 'The assessment results could not be loaded.'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPendingRecords(null);
    setFileError(null);
    setImportError(null);
    setFileName(file?.name ?? null);
    if (!file) return;
    try {
      setPendingRecords(parseRecordsFile(await file.text()));
    } catch (error) {
      setFileError(error instanceof SyntaxError ? 'The file is not valid JSON.' : errorMessage(error, 'The file could not be read.'));
    }
  };

  const handleImport = async () => {
    if (!pendingRecords) return;
    setIsImporting(true);
    setImportError(null);
    try {
      setResults(await importAssessmentRecords(pendingRecords));
      setPendingRecords(null);
      setFileName(null);
    } catch (error) {
      setImportError(error instanceof ApiError ? error.message : 'The records could not be imported. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const hasResults = results !== null && results.summary.total > 0;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-blue-600">Assessment</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">Assessment results</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Each submitted record is shown with its original values. Valid records are saved to patient records, invalid
          records are kept in this log with their reasons, and duplicates are flagged rather than discarded.
        </p>
      </header>

      {loadError && <Notice tone="error">{loadError}</Notice>}

      {isLoading && (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200/70" aria-busy="true" />
      )}

      {!isLoading && results && hasResults && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <SummaryCard label="Total submitted" value={results.summary.total} className="border-slate-200 bg-white text-slate-900" />
            <SummaryCard label="Accepted" value={results.summary.accepted} className="border-emerald-200 bg-emerald-50 text-emerald-800" />
            <SummaryCard label="Rejected" value={results.summary.rejected} className="border-rose-200 bg-rose-50 text-rose-800" />
            <SummaryCard label="Duplicates flagged" value={results.summary.duplicates} className="border-amber-200 bg-amber-50 text-amber-900" />
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">Record</th>
                    <th scope="col" className="px-5 py-3">Result</th>
                    <th scope="col" className="px-5 py-3">Original values</th>
                    <th scope="col" className="px-5 py-3">Reasons and notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.entries.map((entry) => (
                    <EntryRow key={`${entry.record_number}-${entry.status}`} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {!isLoading && results && !hasResults && (
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">No assessment records imported yet</h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose a JSON file containing the assessment records. Each record is validated on the server before anything is
                saved. The import can be run once, so the results stay unchanged afterwards.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 px-5 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50">
              <FileUp className="h-4 w-4" aria-hidden="true" />
              {fileName ?? 'Choose JSON file'}
              <input type="file" accept="application/json,.json" onChange={handleFileChange} className="sr-only" />
            </label>
            <button
              type="button"
              onClick={handleImport}
              disabled={!pendingRecords || isImporting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImporting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isImporting ? 'Importing and generating remarks...' : 'Import records'}
            </button>
          </div>

          {pendingRecords && (
            <Notice tone="info">{pendingRecords.length} record(s) ready to import. Nothing is saved until you press Import.</Notice>
          )}
          {fileError && <Notice tone="error">{fileError}</Notice>}
          {importError && <Notice tone="error">{importError}</Notice>}
        </section>
      )}
    </div>
  );
}
