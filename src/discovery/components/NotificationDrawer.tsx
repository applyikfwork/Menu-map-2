/**
 * Menu Maps Discovery - Student Notification Drawer
 * Displays real event notifications for student contributions, submissions, and achievements.
 */

import React from 'react';
import { Bell, Check, X, ExternalLink, Clock } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  navigate,
}) => {
  const { notifications, markNotificationRead } = useStudentAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between border-l border-[#E7E2DA]">
        <div>
          <div className="p-4 sm:p-5 border-b border-[#E7E2DA] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0F766E]" />
              <h3 className="hd text-base font-bold text-[#1C1917]">Notifications</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(100vh-120px)] space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#0F766E]" />
                <p>No new notifications right now.</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Updates on submissions and challenges will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    notif.is_read
                      ? 'bg-stone-50/70 border-stone-200/60 opacity-80'
                      : 'bg-emerald-50/60 border-emerald-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-xs text-[#1C1917] leading-snug">
                      {notif.title}
                    </h5>
                    {!notif.is_read && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="text-[10px] text-emerald-700 hover:underline font-bold shrink-0 cursor-pointer"
                        title="Mark as read"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </span>

                    {notif.link_url && (
                      <button
                        onClick={() => {
                          onClose();
                          navigate(notif.link_url!);
                        }}
                        className="text-[#0F766E] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-[#E7E2DA] bg-[#FAF8F5]">
          <button
            onClick={onClose}
            className="btn w-full bg-stone-900 text-white min-h-[40px] text-xs font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
