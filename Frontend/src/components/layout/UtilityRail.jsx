import React from 'react';
import { Grid, Flame, Satellite, BarChart3, Sliders } from 'lucide-react';

export const UtilityRail = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', title: 'Operational Overview', icon: Grid },
    { id: 'incident-map', title: 'GIS Incident Map', icon: Flame },
    { id: 'satellite-feeds', title: 'Thermal Sat Feeds', icon: Satellite },
    { id: 'analytics-reports', title: 'Telemetry & Analytics', icon: BarChart3 }
  ];

  return (
    <aside className="fixed left-0 top-[68px] bottom-0 w-16 bg-white border-r border-slate-200 z-40 flex flex-col items-center py-4 justify-between">
      <nav className="flex flex-col items-center gap-2 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              title={item.title}
              className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
                isActive
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-1 w-full px-2">
        <button
          onClick={() => setActiveTab && setActiveTab('settings')}
          title="System Settings"
          className="w-10 h-10 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <Sliders className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};