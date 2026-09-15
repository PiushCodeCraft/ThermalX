import React, { useState, useEffect, useRef } from 'react';
import { Flame, Bell, Clock, MoreVertical, User, Settings, ClipboardList, LogOut } from 'lucide-react';

export const AdminNavbar = ({ activeNav = 'DASHBOARD', onNavigate }) => {
  const [utcTime, setUtcTime] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Synchronized Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`UTC ${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
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

  const handleNavClick = (tabId) => {
    if (tabId === 'DASHBOARD') {
      window.location.hash = '#dashboard';
      if (onNavigate) onNavigate('DASHBOARD');
    } else if (tabId === 'REPORT') {
      window.location.hash = '#report';
      if (onNavigate) onNavigate('REPORT');
    } else if (tabId === 'USER MANAGE') {
      window.location.hash = '#user-manage';
      if (onNavigate) onNavigate('USER MANAGE');
    }
  };

  const notificationItems = [
    { id: 1, text: 'Critical anomaly detected in Bengaluru Sector 4', time: '5m ago', type: 'high' },
    { id: 2, text: 'Satellite VIIRS-Terra orbital pass completed', time: '12m ago', type: 'info' },
    { id: 3, text: 'Wind gust escalation alert: NSW Australia', time: '25m ago', type: 'med' }
  ];

  const navTabs = [
    { id: 'DASHBOARD', label: 'DASHBOARD' },
    { id: 'REPORT', label: 'REPORT' },
    { id: 'USER MANAGE', label: 'USER MANAGE' }
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 px-6 py-4 min-h-[70px] flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
      {/* Left: Brand & Navigation Tabs */}
      <div className="flex items-center gap-8">
        {/* THERMALX Branding */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => handleNavClick('DASHBOARD')}
        >
          <div className="w-8 h-8 rounded bg-[#00236F] flex items-center justify-center text-white shadow-xs">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-xl font-bold uppercase tracking-tight text-slate-950">
            THERMALX
          </span>
        </div>

        {/* Admin Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-6">
          {navTabs.map((tab) => {
            const isActive = activeNav === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`text-[13px] font-semibold tracking-normal transition-colors py-1.5 relative focus:outline-none ${
                  isActive
                    ? 'text-[#00236F] border-b-2 border-[#00236F]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Operational Status, Notifications, UTC Clock, Admin Profile */}
      <div className="flex items-center gap-3">
        {/* System Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-300 rounded-md text-[11.5px]">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-xs" />
          <span className="font-bold text-slate-900 tracking-tight">
            SYSTEM STATUS: OPERATIONAL
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 font-medium">Sat-Feed Active</span>
        </div>

        {/* Notifications Indicator */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-700 hover:text-slate-950 rounded hover:bg-slate-100 transition-colors relative focus:outline-none"
            aria-label="System Notifications"
            type="button"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[15px] h-[15px] px-0.5 bg-red-600 text-white font-bold text-[9px] rounded-full shadow-xs">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-100">
                <span className="font-bold text-[12px] text-slate-900">System Notifications</span>
                <span className="text-[10px] text-blue-700 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notificationItems.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-slate-50 transition-colors">
                    <p className="text-[12px] text-slate-800 font-medium leading-snug">{n.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-300 rounded-md text-[12px] font-mono font-bold text-slate-800 tabular-nums shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{utcTime || 'UTC --:--:--'}</span>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Admin User Profile */}
        <div className="flex items-center gap-2 relative pl-1" ref={userRef}>
          <div className="w-8 h-8 rounded-full bg-[#00236F] text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0">
            AU
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="font-bold text-[12px] leading-tight text-slate-900">
              Admin User
            </span>
            <span className="text-[9.5px] leading-tight text-slate-500 uppercase tracking-wider font-bold">
              ADMINISTRATOR
            </span>
          </div>

          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors focus:outline-none"
            aria-label="Admin User Menu"
            type="button"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-[12px] animate-fade-in">
              <a href="#profile" className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                <User className="w-3.5 h-3.5 text-slate-500" /> Profile
              </a>
              <a href="#settings" className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                <Settings className="w-3.5 h-3.5 text-slate-500" /> System Settings
              </a>
              <a href="#logs" className="flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50">
                <ClipboardList className="w-3.5 h-3.5 text-slate-500" /> Security Logs
              </a>
              <div className="h-px bg-slate-100 my-1" />
              <a href="#logout" className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 font-semibold">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
