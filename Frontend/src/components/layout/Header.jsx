import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Bell,
  Clock,
  MoreVertical,
  User,
  Settings,
  ClipboardList,
  LogOut,
  Radio,
  Grid,
  MapPin,
  Satellite,
  BarChart3
} from 'lucide-react';

export const Header = ({ activeTab, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [utcTime, setUtcTime] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      setUtcTime(`UTC ${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Critical anomaly detected in Bengaluru Sector 4', time: '5m ago', type: 'high' },
    { id: 2, text: 'Satellite VIIRS-Terra orbital pass completed', time: '12m ago', type: 'info' },
    { id: 3, text: 'Wind gust escalation alert: NSW Australia', time: '25m ago', type: 'med' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-[68px]">
      <div className="w-full h-[68px] px-4 flex items-center justify-between gap-3">
        {/* Brand & Nav */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pr-6 border-r border-slate-200">
            <img
              src="/assets/thermal-x-logo.png"
              alt="ThermalX — Emergency Operations & Wildfire Intelligence System"
              className="h-11 w-auto object-contain shrink-0 select-none drop-shadow-xs cursor-pointer"
            />
            <div className="flex flex-col hidden sm:flex">
              <span className="font-bold text-[16px] text-[#00236F] leading-tight tracking-tight">
                ThermalX
              </span>
              <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider">
                Fire Intelligence Platform
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Grid },
              { id: 'incident-map', label: 'Incident Map', icon: MapPin },
              { id: 'satellite-feeds', label: 'Sat Feeds', icon: Satellite },
              { id: 'analytics-reports', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab && setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors text-[12px] font-medium ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-0.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Status Pill */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1 bg-slate-50 border border-slate-200 rounded text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-semibold uppercase text-slate-900">System Status: Operational</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">Sat-Feed Active</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[15px] h-[15px] px-0.5 bg-red-600 text-white font-bold text-[9px] rounded-full">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded shadow-lg py-2 z-50">
                <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-100">
                  <span className="font-semibold text-[12px] text-slate-900">System Notifications</span>
                  <span className="text-[10px] text-blue-700 font-semibold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 hover:bg-slate-50 transition-colors">
                      <p className="text-[12px] text-slate-800 font-medium">{n.text}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-[12px] font-medium tabular-nums text-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{utcTime || 'UTC 14:42'}</span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-1 relative" ref={userRef}>
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-semibold text-xs border border-slate-300">
              AU
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-semibold text-[12px] leading-tight text-slate-900">
                Admin User
              </span>
              <span className="text-[10px] leading-tight text-slate-500 uppercase tracking-wider font-semibold">
                Administrator
              </span>
            </div>

            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              aria-label="User Menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded shadow-lg py-1 z-50">
                <a href="#profile" className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-100 text-[12px]">
                  <User className="w-4 h-4 text-slate-500" /> Profile
                </a>
                <a href="#settings" className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-100 text-[12px]">
                  <Settings className="w-4 h-4 text-slate-500" /> Account Settings
                </a>
                <a href="#logs" className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-100 text-[12px]">
                  <ClipboardList className="w-4 h-4 text-slate-500" /> Activity Log
                </a>
                <div className="h-px bg-slate-100 my-1" />
                <a href="#logout" className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 text-[12px] font-medium">
                  <LogOut className="w-4 h-4" /> Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
