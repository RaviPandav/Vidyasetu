import { useEffect, useState } from "react";
import { adminService } from "../../services";
import { UserGroupIcon, BookOpenIcon, CurrencyRupeeIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <div className="text-2xl font-heading font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-primary-600 font-medium mt-0.5">{sub}</div>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 skeleton" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton" />)}</div>
      <div className="h-72 skeleton rounded-2xl" />
    </div>
  );

  const stats = data?.stats || {};
  const monthlyRevenue = data?.monthlyRevenue || [];

  const chartData = {
    labels: monthlyRevenue.map((m) => MONTHS[(m._id?.month || 1) - 1]),
    datasets: [{
      label: "Revenue (₹)",
      data: monthlyRevenue.map((m) => m.revenue),
      backgroundColor: "rgba(108,99,255,0.7)",
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: "#f3f4f6" } }, x: { grid: { display: false } } },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Full platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserGroupIcon} label="Total Students" value={stats.totalStudents || 0} color="bg-primary-500" />
        <StatCard icon={UserGroupIcon} label="Total Teachers" value={stats.totalTeachers || 0} color="bg-success-500" />
        <StatCard icon={BookOpenIcon} label="Active Courses" value={stats.totalCourses || 0} color="bg-warning-500" />
        <StatCard icon={CurrencyRupeeIcon} label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`} color="bg-accent-500" />
      </div>

      {/* Revenue Chart */}
      {monthlyRevenue.length > 0 && (
        <div className="card">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-6">Monthly Revenue (Last 6 Months)</h2>
          <Bar data={chartData} options={chartOptions} height={100} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-5">Recent Users</h2>
          <div className="space-y-3">
            {(data?.recentUsers || []).map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <span className={`badge capitalize flex-shrink-0 ${user.role === "teacher" ? "badge-primary" : "bg-gray-100 text-gray-600 badge"}`}>{user.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <h2 className="font-heading font-bold text-lg text-gray-900 mb-5">Recent Payments</h2>
          <div className="space-y-3">
            {(data?.recentPayments || []).map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">₹</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.student?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.course?.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-green-600">₹{p.amount}</p>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
