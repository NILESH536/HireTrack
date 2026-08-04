import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDateTime } from '../../utils/helpers';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-300 hover:text-white transition-colors" id="notification-bell">
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 glass-static rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-heading font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-electric hover:text-electric-light">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No notifications yet</p>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => { if (!notif.read) markAsRead(notif.id); }}
                    className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                      !notif.read ? 'bg-electric/5' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-200">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(notif.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
