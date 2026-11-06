import { CheckCircle2, CircleAlert, Copy, type LucideIcon, XCircle } from 'lucide-react';
import type { AssessmentStatus } from '@/types/patient';

interface BadgeStyle {
  label: string;
  className: string;
  icon: LucideIcon;
}

const VALIDITY_BADGES: Record<'valid' | 'invalid', BadgeStyle> = {
  valid: { label: 'Valid', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: CheckCircle2 },
  invalid: { label: 'Invalid', className: 'bg-rose-50 text-rose-700 ring-rose-600/20', icon: XCircle },
};

const ASSESSMENT_BADGES: Record<AssessmentStatus, BadgeStyle> = {
  accepted: { label: 'Accepted', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-700 ring-rose-600/20', icon: XCircle },
  duplicate: { label: 'Duplicate', className: 'bg-amber-50 text-amber-800 ring-amber-600/30', icon: Copy },
};

function Badge({ style }: { style: BadgeStyle }) {
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {style.label}
    </span>
  );
}

export function ValidityBadge({ isValid }: { isValid: boolean }) {
  return <Badge style={VALIDITY_BADGES[isValid ? 'valid' : 'invalid']} />;
}

export function AssessmentStatusBadge({ status }: { status: AssessmentStatus }) {
  return <Badge style={ASSESSMENT_BADGES[status]} />;
}

export function RemarksStatusNote({ status }: { status: 'generated' | 'unavailable' }) {
  if (status === 'generated') return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
      <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
      Unavailable
    </span>
  );
}
