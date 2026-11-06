import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Notice from '@/components/ui/Notice';
import type { PatientFormValues } from '@/types/patient';

interface PatientFormProps {
  initialValues: PatientFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  formError: string | null;
  fieldErrors: Record<string, string>;
  onSubmit: (values: PatientFormValues) => void;
  onCancel?: () => void;
}

const INPUT_CLASS =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100';

function FormField({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-rose-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export default function PatientForm({
  initialValues,
  submitLabel,
  isSubmitting,
  formError,
  fieldErrors,
  onSubmit,
  onCancel,
}: PatientFormProps) {
  const [values, setValues] = useState<PatientFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>(fieldErrors);

  useEffect(() => {
    setErrors(fieldErrors);
  }, [fieldErrors]);

  const updateField = (field: keyof PatientFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const inputClass = (field: keyof PatientFormValues) =>
    `${INPUT_CLASS} ${errors[field] ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300'}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError && <Notice tone="error">{formError}</Notice>}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormField id="full_name" label="Full name" error={errors.full_name}>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="off"
              value={values.full_name}
              onChange={(event) => updateField('full_name', event.target.value)}
              aria-invalid={Boolean(errors.full_name)}
              aria-describedby={errors.full_name ? 'full_name-error' : undefined}
              className={inputClass('full_name')}
              placeholder="e.g. Jane Smith"
            />
          </FormField>
        </div>

        <FormField
          id="date_of_birth"
          label="Date of birth"
          error={errors.date_of_birth}
          hint="Format DD/MM/YYYY, for example 31/12/1990"
        >
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="text"
            inputMode="numeric"
            value={values.date_of_birth}
            onChange={(event) => updateField('date_of_birth', event.target.value)}
            aria-invalid={Boolean(errors.date_of_birth)}
            aria-describedby={errors.date_of_birth ? 'date_of_birth-error' : undefined}
            className={inputClass('date_of_birth')}
            placeholder="DD/MM/YYYY"
          />
        </FormField>

        <FormField id="email" label="Email address" error={errors.email}>
          <input
            id="email"
            name="email"
            type="text"
            inputMode="email"
            autoComplete="off"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputClass('email')}
            placeholder="name@example.com"
          />
        </FormField>

        <FormField id="glucose" label="Glucose (mmol/L)" error={errors.glucose} hint="Numeric value, for example 5.4">
          <input
            id="glucose"
            name="glucose"
            type="text"
            inputMode="decimal"
            value={values.glucose}
            onChange={(event) => updateField('glucose', event.target.value)}
            aria-invalid={Boolean(errors.glucose)}
            aria-describedby={errors.glucose ? 'glucose-error' : undefined}
            className={inputClass('glucose')}
            placeholder="5.4"
          />
        </FormField>

        <FormField id="haemoglobin" label="Haemoglobin (g/dL)" error={errors.haemoglobin} hint="Numeric value, for example 13.5">
          <input
            id="haemoglobin"
            name="haemoglobin"
            type="text"
            inputMode="decimal"
            value={values.haemoglobin}
            onChange={(event) => updateField('haemoglobin', event.target.value)}
            aria-invalid={Boolean(errors.haemoglobin)}
            aria-describedby={errors.haemoglobin ? 'haemoglobin-error' : undefined}
            className={inputClass('haemoglobin')}
            placeholder="13.5"
          />
        </FormField>

        <div className="md:col-span-2">
          <FormField id="cholesterol" label="Cholesterol (mmol/L)" error={errors.cholesterol} hint="Numeric value, for example 4.2">
            <input
              id="cholesterol"
              name="cholesterol"
              type="text"
              inputMode="decimal"
              value={values.cholesterol}
              onChange={(event) => updateField('cholesterol', event.target.value)}
              aria-invalid={Boolean(errors.cholesterol)}
              aria-describedby={errors.cholesterol ? 'cholesterol-error' : undefined}
              className={inputClass('cholesterol')}
              placeholder="4.2"
            />
          </FormField>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving and generating remarks...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
