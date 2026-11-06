import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deletePatient } from '@/lib/api';
import { errorMessage } from '@/lib/format';
import type { PatientRecord } from '@/types/patient';

interface DeletePatientDialogProps {
  patient: PatientRecord;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeletePatientDialog({ patient, onClose, onDeleted }: DeletePatientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setErrorText(null);
    try {
      await deletePatient(patient.id);
      onDeleted();
    } catch (error) {
      setErrorText(errorMessage(error, 'The record could not be deleted. Please try again.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      title="Delete patient record"
      message={`This permanently removes ${patient.full_name} from the patient records. This action cannot be undone.`}
      confirmLabel="Delete record"
      isProcessing={isDeleting}
      errorMessage={errorText}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
