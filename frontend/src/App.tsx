import { useState } from 'react';
import AssessmentPage from '@/components/assessment/AssessmentPage';
import DashboardPage from '@/components/dashboard/DashboardPage';
import PatientsPage from '@/components/patients/PatientsPage';
import RegisterPage from '@/components/register/RegisterPage';
import Sidebar from '@/components/layout/Sidebar';
import type { ViewName } from '@/types/patient';

export default function App() {
  const [view, setView] = useState<ViewName>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 md:flex">
      <Sidebar activeView={view} onNavigate={setView} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {view === 'dashboard' && <DashboardPage onNavigate={setView} />}
          {view === 'patients' && <PatientsPage onNavigate={setView} />}
          {view === 'register' && <RegisterPage onNavigate={setView} />}
          {view === 'assessment' && <AssessmentPage />}
        </div>
      </main>
    </div>
  );
}
