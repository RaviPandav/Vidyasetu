import { useState } from "react";
import { adminService } from "../../services";
import toast from "react-hot-toast";
import { BellIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

const NOTIFICATION_TYPES = ["announcement","course_update","test_alert","live_class_reminder","enrollment"];

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: "", message: "", type: "announcement", targetRole: "student", link: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await adminService.sendNotification(form);
      toast.success(res.data.message);
      setSent(true);
      setForm({ title: "", message: "", type: "announcement", targetRole: "student", link: "" });
      setTimeout(() => setSent(false), 3000);
    } catch {
      toast.error("Failed to send notification");
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Send Notifications</h1>
        <p className="text-gray-500 mt-1">Broadcast announcements to students, teachers, or all users</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
            <BellIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900">Broadcast Message</h2>
            <p className="text-sm text-gray-500">Send to all users of a specific role</p>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Title *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. New course available!"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
            <textarea
              required
              rows={4}
              className="input-field"
              placeholder="Write your notification message here..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {NOTIFICATION_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Send To</label>
              <select className="input-field" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                <option value="student">All Students</option>
                <option value="teacher">All Teachers</option>
                <option value="admin">All Admins</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link (optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. /courses or https://..."
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </div>

          <button type="submit" disabled={sending} className="btn-primary w-full py-3 text-base">
            {sending ? "Sending..." : (
              <><PaperAirplaneIcon className="w-5 h-5" /> Send Notification</>
            )}
          </button>

          {sent && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-700 font-medium">
              ✅ Notification sent successfully!
            </div>
          )}
        </form>
      </div>

      <div className="card bg-primary-50 border-primary-200 border">
        <h3 className="font-semibold text-primary-800 mb-2">💡 Tips</h3>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Notifications are delivered in real-time via Socket.io</li>
          <li>• Students can see all notifications in their Notifications tab</li>
          <li>• Use links to direct users to specific pages (e.g. /student/courses)</li>
          <li>• Keep messages concise and action-oriented</li>
        </ul>
      </div>
    </div>
  );
}
