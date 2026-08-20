import { useState } from 'react';
import { X, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotificationOffcanvas({ isOpen, onClose, notifications, setNotifications }) {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id, link) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    if (link) {
      navigate(link);
      onClose();
    }
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-500 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop with smooth opacity fade */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-500 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Offcanvas Drawer with smooth 500ms slide-in / slide-out */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-sm md:max-w-md bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col z-50 transform transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-rose-500 text-white">
                    {unreadCount} New
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Activity and system alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-white dark:bg-gray-800 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: `Unread (${unreadCount})` },
              { id: 'order', label: 'Orders' },
              { id: 'alert', label: 'Alerts' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-semibold shrink-0 cursor-pointer ml-2"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read All</span>
            </button>
          )}
        </div>

        {/* Notifications Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400 dark:text-gray-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No notifications in this tab</p>
            </div>
          ) : (
            filtered.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id, item.link)}
                  className={`p-4 border transition-all cursor-pointer relative group flex gap-3.5 items-start ${
                    !item.read
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 shadow-xs'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {/* Unread indicator */}
                  {!item.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-amber-500"></span>
                  )}

                  {/* Icon */}
                  <div className={`p-2.5 border shrink-0 ${item.iconColor}`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pr-4">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between">
                      <span>{item.title}</span>
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-2 block">
                      {item.time}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => deleteNotification(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity cursor-pointer absolute bottom-3 right-3"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 flex justify-between items-center text-xs">
          <span className="text-gray-400 font-mono">{notifications.length} Total Alerts</span>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-rose-500 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
