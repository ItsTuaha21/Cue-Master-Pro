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

const MainLayout: React.FC = () => {
  const { currentUser, activeView } = useApp();

  // If user selected login view
  if (activeView === 'login') {
    return <LoginPage />;
  }

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
        return <ApprovalsPage />;
      case 'products':
        return <ProductsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'members':
      case 'memberships':
      case 'players':
        return <MembershipsPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'audit':
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'settings':
        return <SettingsPage />;
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
