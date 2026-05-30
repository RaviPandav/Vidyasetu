// AdminCourses.jsx
import { useEffect, useState } from "react";
import { adminService } from "../../services";
import toast from "react-hot-toast";
import { CheckCircleIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const fetchCourses = () => {
    setLoading(true);
    const params = { search };
    if (filter === "approved") params.isApproved = true;
    if (filter === "pending") params.isApproved = false;
    adminService.getCourses(params)
      .then((res) => setCourses(res.data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, [search, filter]);

  const handleApprove = async (id) => {
    try {
      const res = await adminService.approveCourse(id);
      toast.success(res.data.message);
      fetchCourses();
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete course "${title}"?`)) return;
    try {
      await adminService.deleteCourse(id);
      toast.success("Course deleted");
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-gray-900">Course Management</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" className="input-field pl-10" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Courses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending Approval</option>
        </select>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Course", "Teacher", "Category", "Price", "Enrollments", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-6 skeleton" /></td></tr>)
            ) : courses.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">No courses found</td></tr>
            ) : courses.map((c) => (
              <tr key={c._id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">{c.title}</td>
                <td className="py-3 px-4 text-gray-500">{c.teacher?.name}</td>
                <td className="py-3 px-4"><span className="badge-primary text-xs">{c.category}</span></td>
                <td className="py-3 px-4 font-semibold text-gray-900">₹{c.price}</td>
                <td className="py-3 px-4 text-gray-500">{c.enrollmentCount || 0}</td>
                <td className="py-3 px-4">
                  {c.isApproved ? <span className="badge-success">Approved</span> : <span className="badge-warning">Pending</span>}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => handleApprove(c._id)} className="p-1.5 hover:bg-green-50 rounded-lg" title={c.isApproved ? "Unapprove" : "Approve"}>
                      <CheckCircleIcon className={`w-4 h-4 ${c.isApproved ? "text-gray-400" : "text-green-500"}`} />
                    </button>
                    <button onClick={() => handleDelete(c._id, c.title)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
