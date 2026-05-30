import { useEffect, useState } from "react";
import { adminService } from "../../services";

const statusColor = { completed: "badge-success", pending: "badge-warning", failed: "badge-danger", refunded: "bg-gray-100 text-gray-600 badge" };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([
      adminService.getPayments({ status, limit: 30 }),
      adminService.getPaymentStats(),
    ]).then(([pRes, sRes]) => {
      setPayments(pRes.data.payments || []);
      setStats(sRes.data.stats || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [status]);

  const totalRevenue = stats.find((s) => s._id === "completed")?.total || 0;
  const totalCompleted = stats.find((s) => s._id === "completed")?.count || 0;
  const totalPending = stats.find((s) => s._id === "pending")?.count || 0;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-gray-900">Payments</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-heading font-bold text-green-600">₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div className="text-sm text-gray-500 mt-1">Total Revenue</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading font-bold text-primary-600">{totalCompleted}</div>
          <div className="text-sm text-gray-500 mt-1">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-heading font-bold text-orange-500">{totalPending}</div>
          <div className="text-sm text-gray-500 mt-1">Pending</div>
        </div>
      </div>

      <div className="flex justify-end">
        <select className="input-field w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Payments</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Invoice", "Student", "Course", "Amount", "Gateway", "Status", "Date"].map((h) => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(6)].map((_, i) => <tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-5 skeleton" /></td></tr>)
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No payments found</td></tr>
            ) : payments.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{p.invoiceId}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{p.student?.name}</td>
                <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{p.course?.title}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">₹{p.amount}</td>
                <td className="py-3 px-4 capitalize text-gray-500">{p.gateway}</td>
                <td className="py-3 px-4"><span className={`capitalize ${statusColor[p.status] || "badge"}`}>{p.status}</span></td>
                <td className="py-3 px-4 text-gray-400">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
