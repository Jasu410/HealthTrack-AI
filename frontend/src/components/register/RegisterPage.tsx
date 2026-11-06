import { CheckCircle2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import AiRemarksPanel from '@/components/patients/AiRemarksPanel';
import PatientForm from '@/components/patients/PatientForm';
import { ApiError, createPatient } from '@/lib/api';
import { EMPTY_PATIENT_FORM, type PatientFormValues, type PatientRecord, type ViewName } from '@/types/patient';

interface RegisterPageProps {
  onNavigate: (view: ViewName) => void;
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [formKey, setFormKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedPatient, setSavedPatient] = useState<PatientRecord | null>(null);

  const handleSubmit = async (values: PatientFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const patient = await createPatient(values);
      setSavedPatient(patient);
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        setFieldErrors(error.fieldErrors);
      } else {
        setFormError('Something went wrong while saving. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    setSavedPatient(null);
    setFormError(null);
    setFieldErrors({});
    setFormKey((key) => key + 1);
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-blue-600">Patients</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">Add a patient</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Enter the patient details and blood test results. Valid records are saved and general AI remarks are generated
          from the blood test values.
        </p>
      </header>

      {savedPatient ? (
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{savedPatient.full_name} has been saved</h2>
              <p className="text-sm text-slate-600">The record is now available in patient records.</p>
            </div>
          </div>
          <AiRemarksPanel remarks={savedPatient.ai_remarks} status={savedPatient.ai_remarks_status} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate('patients')}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              View patient records
            </button>
            <button
              type="button"
              onClick={handleAddAnother}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Add another patient
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <PatientForm
            key={formKey}
            initialValues={EMPTY_PATIENT_FORM}
            submitLabel="Save patient"
            isSubmitting={isSubmitting}
            formError={formError}
            fieldErrors={fieldErrors}
            onSubmit={handleSubmit}
          />
        </section>
      )}
    </div>
  );
}
