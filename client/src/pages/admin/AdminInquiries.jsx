import { useEffect, useState } from "react";
import { adminService } from "../../services";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchInquiries = () => {
    setLoading(true);
    adminService
      .getInquiries({ search, status, page, limit: 15 })
      .then((res) => {
        setInquiries(res.data.inquiries || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  const StatusBadge = ({ s }) => {
    const map = {
      new: "badge-primary",
      contacted: "badge-success",
      converted: "badge-warning",
      closed: "badge-danger",
    };
    return <span className={map[s] || "badge"}>{s || "unknown"}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-500 mt-1">{total} total inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search by name/email/phone/message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="input-field sm:w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="converted">converted</option>
          <option value="closed">closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Email", "Phone", "Subject", "Message", "Status", "Date"].map((h) => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="py-4 px-4">
                    <div className="h-6 skeleton" />
                  </td>
                </tr>
              ))
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  No inquiries found
                </td>
              </tr>
            ) : (
              inquiries.map((inq) => (
                <tr key={inq._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">{inq.name}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{inq.email}</td>
                  <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{inq.phone || "-"}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{inq.subject || "-"}</td>
                  <td className="py-3 px-4 text-gray-600 max-w-md truncate">{inq.message}</td>
                  <td className="py-3 px-4">
                    <StatusBadge s={inq.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {new Date(inq.createdAt).toLocaleDateString("en-IN")}
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
                page === i + 1
                  ? "bg-primary-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
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

