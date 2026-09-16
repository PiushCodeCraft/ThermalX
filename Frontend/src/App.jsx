import React, { useState, useEffect } from 'react';
import AdminDashboard from './pages/admin_dashboard';
import AdminReport from './pages/admin_report';
import AdminUserMgmt from './pages/admin_user_mgmt';
import UserDashboard from './pages/user_dashboard';
import './styles/global.css';

export function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#report') return 'REPORT';
    if (hash === '#user-manage' || hash === '#users') return 'USER MANAGE';
    if (hash === '#user' || hash === '#user-dashboard') return 'USER DASHBOARD';
    return 'DASHBOARD';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  switch (currentPage) {
    case 'REPORT':
      return <AdminReport onNavigate={handleNavigate} />;
    case 'USER MANAGE':
      return <AdminUserMgmt onNavigate={handleNavigate} />;
    case 'USER DASHBOARD':
      return <UserDashboard />;
    case 'DASHBOARD':
    default:
      return <AdminDashboard onNavigate={handleNavigate} />;
  }
}

export default App