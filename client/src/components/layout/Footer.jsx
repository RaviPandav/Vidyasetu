import { Link } from "react-router-dom";
import {
  AcademicCapIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

const platformLinks = [
  { label: "Courses", to: "/courses" },
  { label: "Teachers", to: "/teachers" },
  { label: "Contact", to: "/contact" },
  { label: "Login", to: "/login" },
];

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Register", to: "/register" },
  { label: "Explore Courses", to: "/courses" },
  { label: "Get Support", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-950 text-gray-300">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="mb-4 inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                <AcademicCapIcon className="h-6 w-6" />
              </div>
              <span className="font-heading text-2xl font-bold text-white">
                Vidya<span className="text-primary-400">Setu</span>
              </span>
            </Link>
            <p className="max-w-md text-sm leading-6 text-gray-400">
              Bridge of Knowledge for students, teachers, and institutes. Learn with live classes,
              recorded courses, quizzes, attendance, and doubt support in one place.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Platform</h4>
            <ul className="space-y-3 text-sm">
              {platformLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-primary-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-primary-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-4 border-t border-gray-800 pt-8 text-sm text-gray-400 md:grid-cols-3">
          <a href="mailto:hello@vidyasetu.com" className="inline-flex items-center gap-2 hover:text-primary-400">
            <EnvelopeIcon className="h-4 w-4" />
            hello@vidyasetu.com
          </a>
          <a href="tel:+919876543210" className="inline-flex items-center gap-2 hover:text-primary-400">
            <PhoneIcon className="h-4 w-4" />
            +91 98765 43210
          </a>
          <span className="inline-flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            Surat, Gujarat
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-gray-800 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} VidyaSetu. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="hover:text-primary-400">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-primary-400">Terms</Link>
            <Link to="/contact" className="hover:text-primary-400">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
