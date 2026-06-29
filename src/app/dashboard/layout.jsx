import Sidebar from '@/components/dashboard/DashboardSidebar';
import BlockedGuard from '@/components/dashboard/BlockedGuard';
import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <BlockedGuard>
      <div className="flex min-h-screen bg-[#f4f8f6]">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </BlockedGuard>
  );
};

export default DashboardLayout;