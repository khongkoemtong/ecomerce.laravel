import { useState } from 'react';
import { Search, Bell, Sun, Moon, Menu, PanelRight, ShoppingBag, AlertTriangle, Star, CreditCard, Gift } from 'lucide-react';
import NotificationOffcanvas from './NotificationOffcanvas';

const initialNotifications = [
  {
    id: 'n1',
    type: 'order',
    title: 'New Order Received',
    message: 'Order #ORD-9022 ($48.50) placed by Sophea Chan',
    time: '2 mins ago',
    read: false,
    icon: ShoppingBag,
    iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    link: '/order-line',
  },
  {
    id: 'n2',
    type: 'alert',
    title: 'Low Inventory Warning',
    message: 'Espresso Coffee Beans stock is below threshold (1.5 kg remaining)',
    time: '15 mins ago',
    read: false,
    icon: AlertTriangle,
    iconColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    link: '/manage-inventory',
  },
  {
    id: 'n3',
    type: 'review',
    title: 'New Product Rating',
    message: 'Dara Heng gave 5 stars for Iced Caramel Macchiato',
    time: '1 hour ago',
    read: false,
    icon: Star,
    iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    link: '/reviews',
  },
  {
    id: 'n4',
    type: 'payment',
    title: 'Payment Confirmed',
    message: 'ABA PAY QR payment of $34.20 verified for TXN-9021',
    time: '2 hours ago',
    read: false,
    icon: CreditCard,
    iconColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    link: '/payments',
  },
  {
    id: 'n5',
    type: 'promo',
    title: 'Promo Coupon Applied',
    message: 'Code WELCOME20 redeemed by Linda Kim on checkout',
    time: '4 hours ago',
    read: true,
    icon: Gift,
    iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    link: '/promotions',
  },
];

export default function Header({ isDark, toggleDark, toggleLeft, toggleRight, showRightToggle = true }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="h-20 shrink-0 bg-white dark:bg-gray-800 px-8 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLeft}
            className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {/* Search Bar */}
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search menu, orders and more"
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:text-gray-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
            />
          </div>
        </div>

        {/* Right Side Icons & Profile */}
        <div className="flex items-center gap-5">
          {showRightToggle && (
            <button
              onClick={toggleRight}
              className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm cursor-pointer"
              title="Toggle Right Sidebar"
            >
              <PanelRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={toggleDark}
            className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Notification Button with Badge Count */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-extrabold font-mono flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-xs leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 ml-2 border-l pl-4 border-gray-200 dark:border-gray-700">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile"
              className="w-10 h-10 object-cover border border-gray-300 dark:border-gray-600 shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Ibrahim Kadri</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Offcanvas Drawer */}
      <NotificationOffcanvas
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </>
  );
}