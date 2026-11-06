import { useState } from 'react';
import PatientForm from '@/components/patients/PatientForm';
import Modal from '@/components/ui/Modal';
import { ApiError, updatePatient } from '@/lib/api';
import type { PatientFormValues, PatientRecord } from '@/types/patient';

interface EditPatientModalProps {
  patient: PatientRecord;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditPatientModal({ patient, onClose, onSaved }: EditPatientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const initialValues: PatientFormValues = {
    full_name: patient.full_name,
    date_of_birth: patient.date_of_birth,
    email: patient.email,
    glucose: String(patient.glucose),
    haemoglobin: String(patient.haemoglobin),
    cholesterol: String(patient.cholesterol),
  };

  const handleSubmit = async (values: PatientFormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await updatePatient(patient.id, values);
      onSaved();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
        setFieldErrors(error.fieldErrors);
      } else {
        setFormError('The changes could not be saved. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Edit ${patient.full_name}`} onClose={onClose} maxWidthClass="max-w-2xl">
      <PatientForm
        initialValues={initialValues}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        formError={formError}
        fieldErrors={fieldErrors}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
