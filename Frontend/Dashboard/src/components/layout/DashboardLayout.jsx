import React from 'react';
import { Header } from './Header';

export const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="w-full min-h-[calc(100vh-68px)] pt-[68px]">
        <div className="max-w-[1440px] mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
