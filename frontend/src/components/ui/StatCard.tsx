import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'blue' | 'emerald' | 'rose' | 'slate';
}

const TONE_CLASSES: Record<StatCardProps['tone'], { icon: string; value: string }> = {
  blue: { icon: 'bg-blue-50 text-blue-600', value: 'text-blue-700' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-700' },
  rose: { icon: 'bg-rose-50 text-rose-600', value: 'text-rose-700' },
  slate: { icon: 'bg-slate-100 text-slate-600', value: 'text-slate-900' },
};

export default function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  const classes = TONE_CLASSES[tone];
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${classes.icon}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className={`mt-3 text-3xl font-semibold tabular-nums ${classes.value}`}>{value}</p>
    </div>
  );
}
