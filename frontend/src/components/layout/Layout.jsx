import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import Sidebar from '../Sidebar.jsx';

const Layout = ({ children }) => {
  const { preferences } = useAuth();

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = preferences.theme === 'dark';
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', preferences.theme);
  }, [preferences.theme]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
