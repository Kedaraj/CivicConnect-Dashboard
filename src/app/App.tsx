import { useState } from 'react';
import { Toaster } from 'sonner';
import { SplashScreen } from './components/SplashScreen';
import { LoginPage } from './components/LoginPage';

// Role-based dashboards
import { PoliceDashboard } from './components/roles/police/PoliceDashboard';
import { AmbulanceDashboard } from './components/roles/ambulance/AmbulanceDashboard';
import { ConstructionDashboard } from './components/roles/construction/ConstructionDashboard';
import { AdminDashboard } from './components/roles/admin/AdminDashboard';

export default function App() {
  const [appState, setAppState] = useState<'splash' | 'login' | 'main'>('splash');
  const [userRole, setUserRole] = useState<string>('');

  const handleSplashComplete = () => {
    setAppState('login');
  };

  const handleLogin = (role: string) => {
    setUserRole(role);
    setAppState('main');
  };

  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Render role-based dashboard
  const renderDashboard = () => {
    switch (userRole) {
      case 'police':
        return <PoliceDashboard />;
      case 'ambulance':
        return <AmbulanceDashboard />;
      case 'construction':
        return <ConstructionDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <PoliceDashboard />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-white overflow-hidden">
        {renderDashboard()}
      </div>
      <Toaster position="top-center" richColors />
    </>
  );
}
