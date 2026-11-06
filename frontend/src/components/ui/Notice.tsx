import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type NoticeTone = 'error' | 'success' | 'info' | 'warning';

const TONE_STYLES: Record<NoticeTone, { container: string; icon: typeof Info }> = {
  error: { container: 'border-rose-200 bg-rose-50 text-rose-800', icon: XCircle },
  success: { container: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
  info: { container: 'border-sky-200 bg-sky-50 text-sky-900', icon: Info },
  warning: { container: 'border-amber-200 bg-amber-50 text-amber-900', icon: AlertTriangle },
};

interface NoticeProps {
  tone: NoticeTone;
  children: ReactNode;
}

export default function Notice({ tone, children }: NoticeProps) {
  const { container, icon: Icon } = TONE_STYLES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${container}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  );
}
