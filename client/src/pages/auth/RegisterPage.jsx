import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import useAuthStore from "../../context/authStore";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", phone: "" });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      toast.success(result.message);
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-accent-500 items-center justify-center p-12">
        <div className="text-center text-white max-w-sm">
          <div className="text-8xl mb-6">✨</div>
          <h2 className="font-heading text-3xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-white/80 leading-relaxed">
            Join thousands of students achieving their academic dreams with VidyaSetu's expert guidance.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">VS</div>
            <span className="font-heading font-bold text-xl text-gray-900">VidyaSetu</span>
          </Link>

          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600 mb-8">Free forever. No credit card required.</p>

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            {["student", "teacher"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-3 rounded-xl border-2 font-semibold capitalize transition-all ${
                  form.role === r
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {r === "student" ? "🎒 " : "👨‍🏫 "}{r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Your full name"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-12"
                  placeholder="Min. 6 characters"
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

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base mt-2">
              {isLoading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
