import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import useAuthStore from "../../context/authStore";
import useDarkMode from "../../hooks/useDarkMode";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Teachers", to: "/teachers" },
  { label: "Contact", to: "/contact" },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, toggleDark] = useDarkMode();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return "/login";
    return `/${user.role}/dashboard`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-heading font-bold text-sm">
                VS
              </div>
              <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                Vidya<span className="gradient-text">Setu</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDark}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <button onClick={() => navigate(getDashboardPath())} className="btn-primary text-sm">
                  My Dashboard
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">Login</Link>
                  <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                </div>
              )}

              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white dark:bg-gray-900 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium rounded-lg hover:bg-primary-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" className="btn-secondary text-center text-sm">Login</Link>
              <Link to="/register" className="btn-primary text-center text-sm">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Page Content ──────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  VS
                </div>
                <span className="text-white font-heading font-bold text-xl">VidyaSetu</span>
              </Link>
              <p className="text-sm leading-relaxed">
                Bridge of Knowledge — empowering students across Gujarat and beyond.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                {["Courses", "Teachers", "Live Classes", "Doubt Support"].map((item) => (
                  <li key={item}><a href="#" className="hover:text-primary-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                {["About Us", "Careers", "Blog", "Contact"].map((item) => (
                  <li key={item}><a href="#" className="hover:text-primary-400 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 hello@vidyasetu.com</li>
                <li>📞 +91 9558453510</li>
                <li>📍 Surat, Gujarat</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© {new Date().getFullYear()} VidyaSetu. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-400">Privacy Policy</a>
              <a href="#" className="hover:text-primary-400">Terms of Service</a>
              <a href="#" className="hover:text-primary-400">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
