import { ClipboardCheck, HeartPulse, LayoutDashboard, Menu, UserPlus, Users, X, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ViewName } from '@/types/patient';

interface NavItem {
  view: ViewName;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'patients', label: 'Patient records', icon: Users },
  { view: 'register', label: 'Add patient', icon: UserPlus },
  { view: 'assessment', label: 'Assessment results', icon: ClipboardCheck },
];

interface SidebarProps {
  activeView: ViewName;
  onNavigate: (view: ViewName) => void;
}

function NavList({ activeView, onSelect }: { activeView: ViewName; onSelect: (view: ViewName) => void }) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
        const isActive = view === activeView;
        return (
          <button
            key={view}
            type="button"
            onClick={() => onSelect(view)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
        <HeartPulse className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">HealthTrack AI</p>
        <p className="text-xs text-slate-500">Patient management</p>
      </div>
    </div>
  );
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSelect = (view: ViewName) => {
    onNavigate(view);
    setIsMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <aside className="relative flex h-full w-72 max-w-[85%] flex-col bg-white p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList activeView={activeView} onSelect={handleSelect} />
          </aside>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 md:flex">
        <div className="mb-8">
          <Brand />
        </div>
        <NavList activeView={activeView} onSelect={handleSelect} />
        <p className="mt-auto text-xs leading-relaxed text-slate-400">
          General health information only. Not a medical diagnosis.
        </p>
      </aside>
    </>
  );
}
