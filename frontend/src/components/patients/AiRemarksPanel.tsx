import { Sparkles } from 'lucide-react';
import Notice from '@/components/ui/Notice';

interface AiRemarksPanelProps {
  remarks: string | null;
  status: 'generated' | 'unavailable';
}

export default function AiRemarksPanel({ remarks, status }: AiRemarksPanelProps) {
  return (
    <section aria-labelledby="ai-remarks-heading" className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
        <h3 id="ai-remarks-heading" className="text-sm font-semibold text-blue-900">
          AI health remarks
        </h3>
      </div>
      {status === 'generated' && remarks ? (
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{remarks}</p>
      ) : (
        <Notice tone="warning">
          AI remarks are unavailable for this record. The patient details are saved, and the remarks can be generated
          again by editing the blood test values.
        </Notice>
      )}
    </section>
  );
}
