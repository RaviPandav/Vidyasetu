import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import useAuthStore from "../../context/authStore";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success("Welcome back!");
      const user = useAuthStore.getState().user;
      navigate(`/${user.role}/dashboard`);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">VS</div>
            <span className="font-heading font-bold text-xl text-gray-900">VidyaSetu</span>
          </Link>

          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">Sign in to continue your learning journey</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base">
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12">
        <div className="text-center text-white max-w-sm">
          <div className="text-8xl mb-6">🎓</div>
          <h2 className="font-heading text-3xl font-bold mb-4">Continue Learning</h2>
          <p className="text-primary-200 leading-relaxed">
            Access your courses, track your progress, and connect with your teachers — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {["Video Lectures", "Live Classes", "Practice Tests", "Doubt Support"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-500 rounded-full" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
