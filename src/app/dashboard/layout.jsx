import Sidebar from '@/components/dashboard/DashboardSidebar';
import BlockedGuard from '@/components/dashboard/BlockedGuard';
import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <BlockedGuard>
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#f4f8f6] dark:bg-[#0b1220]">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </BlockedGuard>
  );
};

export default DashboardLayout;