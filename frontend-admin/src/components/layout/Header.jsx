import { Search, Bell, Sun, Moon, Menu, PanelRight } from 'lucide-react';

export default function Header({ isDark, toggleDark, toggleLeft, toggleRight, showRightToggle = true }) {
  return (
    <header className="h-20 shrink-0 bg-white dark:bg-gray-800 px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button onClick={toggleLeft} className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm">
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        {/* Search Bar */}
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search menu, orders and more"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:text-gray-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
          />
        </div>
      </div>

      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-5">
        {showRightToggle && (
          <button onClick={toggleRight} className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm" title="Toggle Right Sidebar">
            <PanelRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
        {/* Theme Toggle */}
        <button 
          onClick={toggleDark}
          className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
          title="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <button className="relative p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-700"></span>
        </button>

        <div className="flex items-center gap-3 ml-2 border-l pl-4 border-gray-200 dark:border-gray-700">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Ibrahim Kadri</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}