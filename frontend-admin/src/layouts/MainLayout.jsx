import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function MainLayout() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isLeftOpen, setIsLeftOpen] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(!isDark);

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 flex overflow-hidden font-sans text-gray-800 dark:text-gray-100 transition-colors duration-200">
      <Sidebar isOpen={isLeftOpen} />
      
      <main className="flex-1 flex flex-col h-full bg-transparent min-w-0 overflow-auto custom-scrollbar">
        <Header 
          isDark={isDark} 
          toggleDark={toggleDark} 
          toggleLeft={() => setIsLeftOpen(!isLeftOpen)}
          showRightToggle={false}
        />
        <div className="flex-1">
          <Outlet context={{ isSidebarOpen: isLeftOpen, isRightSidebarOpen: false }} />
        </div>
      </main>
    </div>
  );
}