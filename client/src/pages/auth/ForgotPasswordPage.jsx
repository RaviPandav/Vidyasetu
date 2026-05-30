// ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../../services";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="card w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">VS</div>
          <span className="font-heading font-bold text-xl text-gray-900">VidyaSetu</span>
        </Link>
        {sent ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="font-heading text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">We've sent a password reset link to <strong>{email}</strong></p>
            <Link to="/login" className="btn-primary w-full">Back to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
            <p className="text-gray-600 mb-6">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="text-center text-gray-600 mt-4">
              <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
export default ForgotPasswordPage;
