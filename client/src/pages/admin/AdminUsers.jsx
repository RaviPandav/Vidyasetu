import { useEffect, useState } from "react";
import { adminService } from "../../services";
import toast from "react-hot-toast";
import { MagnifyingGlassIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    adminService.getUsers({ search, role, page, limit: 15 })
      .then((res) => {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, role, page]);

  const handleToggle = async (id) => {
    try {
      const res = await adminService.toggleUserStatus(id);
      toast.success(res.data.message);
      fetchUsers();
    } catch { toast.error("Failed to update status"); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(id);
      toast.success("User deleted");
      fetchUsers();
    } catch { toast.error("Failed to delete user"); }
  };

  const roleColor = { admin: "badge-danger", teacher: "badge-primary", student: "bg-gray-100 text-gray-600 badge" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input-field sm:w-40" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["User", "Role", "Status", "Joined", "Actions"].map((h) => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="py-4 px-4"><div className="h-6 skeleton" /></td></tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No users found</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`capitalize ${roleColor[user.role] || "badge"}`}>{user.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    {user.isActive
                      ? <span className="badge-success">Active</span>
                      : <span className="badge-danger">Inactive</span>
                    }
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggle(user._id)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title={user.isActive ? "Deactivate" : "Activate"}
                      >
                        {user.isActive
                          ? <XCircleIcon className="w-4 h-4 text-orange-500" />
                          : <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        }
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.name)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <TrashIcon className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1 ? "bg-primary-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
