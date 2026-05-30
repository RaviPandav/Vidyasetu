// ResetPasswordPage.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../../services";

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card w-full max-w-md">
        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-600 mb-6">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="New password (min. 6 characters)"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default ResetPasswordPage;
