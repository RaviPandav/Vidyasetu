import { useEffect, useState } from "react";
import { studentService } from "../../services";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";

const typeIcon = {
  course_update: "📚", new_lecture: "🎬", test_alert: "📝",
  doubt_answered: "💬", payment_success: "✅", live_class_reminder: "🎥",
  announcement: "📢", enrollment: "🎉", result: "📊",
};

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    studentService.getNotifications()
      .then((res) => {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    await studentService.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  if (loading) return <div className="animate-pulse space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-primary-600 mt-1">{unreadCount} unread</p>}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-20">
          <BellIcon className="w-14 h-14 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card flex items-start gap-4 transition-all ${!n.isRead ? "border-l-4 border-primary-500 bg-primary-50/30" : ""}`}
            >
              <div className="text-2xl flex-shrink-0">{typeIcon[n.type] || "🔔"}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markRead(n._id)}
                  className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors flex-shrink-0"
                  title="Mark as read"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
