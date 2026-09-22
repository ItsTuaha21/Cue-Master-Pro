import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { OwnerSidebar } from './components/layout/OwnerSidebar';
import { EmployeeSidebar } from './components/layout/EmployeeSidebar';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { TablesPage } from './pages/owner/OwnerTablesPage';
import { EmployeeSalesPage } from './pages/employee/EmployeeSalesPage';
import { InvoicesPage } from './pages/owner/OwnerInvoicesPage';
import { ShiftsPage } from './pages/shifts/ShiftsPage';
import { CollectionsPage } from './pages/shifts/CollectionsPage';
import { ApprovalsPage } from './pages/owner/ApprovalsPage';
import { ProductsPage } from './pages/owner/ProductsPage';
import { InventoryPage } from './pages/owner/InventoryPage';
import { ExpensesPage } from './pages/owner/ExpensesPage';
import { MembershipsPage } from './pages/owner/MembershipsPage';
import { BookingsPage } from './pages/owner/BookingsPage';
import { EmployeesPage } from './pages/owner/EmployeesPage';
import { ReportsPage } from './pages/owner/ReportsPage';
import { AuditLogsPage } from './pages/owner/AuditLogsPage';
import { SettingsPage } from './pages/owner/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OnboardingStatusScreen } from './pages/auth/OnboardingStatusScreen';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    currentWorkspace,
    isAuthenticated,
    onboardingStatus,
    isAuthLoading,
    refreshAuth,
    logout,
    activeView,
    setActiveView,
  } = useApp();

  // 1. Session verification loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#060908] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xl mb-4 animate-pulse">
          8
        </div>
        <div className="flex items-center gap-2 text-white font-bold text-base">
          Cue<span className="text-emerald-400">Desk</span>
        </div>
        <div className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Verifying workspace session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Public Routing
  if (!isAuthenticated || !currentUser || !currentUser.id) {
    if (activeView === 'signup') {
      return <SignupPage />;
    }
    return <LoginPage />;
  }

  // 3. Authenticated Tenant Onboarding Status Guard
  if (onboardingStatus && onboardingStatus !== 'active') {
    return (
      <OnboardingStatusScreen
        status={onboardingStatus}
        workspace={currentWorkspace}
        user={currentUser}
        onRefresh={refreshAuth}
        onLogout={logout}
      />
    );
  }

  // 4. Role Authorization for Protected Workspace
  const isManagement = currentUser.role === 'owner' || currentUser.role === 'manager';

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return isManagement ? <OwnerDashboard /> : <EmployeeDashboard />;
      case 'tables':
      case 'sessions':
        return <TablesPage />;
      case 'sales':
        return <EmployeeSalesPage />;
      case 'invoices':
      case 'payments':
        return <InvoicesPage />;
      case 'shifts':
        return <ShiftsPage />;
      case 'collections':
        return <CollectionsPage />;
      case 'approvals':
      case 'requests':
        return isManagement ? <ApprovalsPage /> : <EmployeeDashboard />;
      case 'products':
        return isManagement ? <ProductsPage /> : <EmployeeDashboard />;
      case 'inventory':
        return isManagement ? <InventoryPage /> : <EmployeeDashboard />;
      case 'expenses':
        return isManagement ? <ExpensesPage /> : <EmployeeDashboard />;
      case 'members':
      case 'memberships':
      case 'players':
        return isManagement ? <MembershipsPage /> : <EmployeeDashboard />;
      case 'bookings':
        return isManagement ? <BookingsPage /> : <EmployeeDashboard />;
      case 'employees':
        return isManagement ? <EmployeesPage /> : <EmployeeDashboard />;
      case 'reports':
        return isManagement ? <ReportsPage /> : <EmployeeDashboard />;
      case 'audit':
      case 'audit-logs':
        return isManagement ? <AuditLogsPage /> : <EmployeeDashboard />;
      case 'settings':
        return isManagement ? <SettingsPage /> : <EmployeeDashboard />;
      default:
        return isManagement ? <OwnerDashboard /> : <EmployeeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060908] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Universal Navbar */}
      <Navbar />

      <div className="flex-1 flex">
        {/* Dynamic Sidebar based on active role */}
        {isManagement ? <OwnerSidebar /> : <EmployeeSidebar />}

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-61px)] bg-[#060908]">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
