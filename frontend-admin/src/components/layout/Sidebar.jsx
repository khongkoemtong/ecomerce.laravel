import { LayoutDashboard, ShoppingBag, Package, Tag, Users, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Order Line', icon: ShoppingBag, path: '/order-line' },
  { name: 'Manage Inventory', icon: Package, path: '/manage-inventory' },
  { name: 'Manage Products', icon: Tag, path: '/manage-products' },
  { name: 'Customers', icon: Users, path: '/customers' },
];

const bottomNavItems = [
  { name: 'Settings', icon: Settings, path: '/settings' },
  { name: 'Logout', icon: LogOut, path: '/logout' },
];

export default function Sidebar({ isOpen }) {
  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white shrink-0 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)] overflow-hidden`}>
      {/* Logo */}
      <div className={`p-8 flex items-center ${isOpen ? 'gap-3' : 'justify-center'} h-24 shrink-0`}>
        <div className="w-8 h-8 shrink-0 rounded-full bg-amber-500 relative flex items-center justify-center shadow-sm">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white dark:border-b-gray-800 rotate-45 absolute -ml-1 -mt-1"></div>
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-white dark:border-t-gray-800 -rotate-45 absolute ml-1 mt-1"></div>
        </div>
        {isOpen && (
          <h1 className="text-xl font-bold leading-tight dark:text-white whitespace-nowrap">
            Tasty<br />Station
          </h1>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center'} py-3 rounded font-medium transition-all ${
                isActive
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
              }`
            }
            title={!isOpen ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 py-8 space-y-1 border-t border-gray-100 dark:border-gray-700 shrink-0">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center'} py-3 rounded font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors border border-transparent`}
            title={!isOpen ? item.name : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}