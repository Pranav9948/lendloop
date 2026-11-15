
"use client";


import { useMutation, useQuery } from "convex/react";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useQuery(
    api.notifications.listMyNotifications,
  );

  const unreadCount = useQuery(
    api.notifications.getUnreadNotificationCount,
  );

  const markAsRead = useMutation(
    api.notifications.markNotificationAsRead,
  );

  const markAllAsRead = useMutation(
    api.notifications.markAllNotificationsAsRead,
  );

  const notificationList = notifications ?? [];
  const unread = unreadCount ?? 0;

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    await markAsRead({ notificationId: id });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead({});
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="relative flex size-10 items-center justify-center rounded-full text-[#20352b] transition-colors hover:bg-[#f0f5ef]"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={21} />

        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-[100] mt-3 w-80 overflow-hidden rounded-xl border border-[#e8eee8] bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                Notifications
              </h3>
              <p className="text-xs text-gray-500">
                {unread} unread
              </p>
            </div>

            {unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications === undefined ? (
              <p className="p-8 text-center text-sm text-gray-500">
                Loading notifications...
              </p>
            ) : notificationList.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                No notifications yet.
              </p>
            ) : (
              notificationList.map((notification) => (
                <div
                  key={notification._id}
                  className={`border-b p-4 ${notification.isRead ? "bg-white" : "bg-blue-50"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="shrink-0 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
