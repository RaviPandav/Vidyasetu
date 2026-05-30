import { useState } from "react";
import { publicService } from "../../services";
import toast from "react-hot-toast";
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import ContactMap from "../../components/ContactMap";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await publicService.submitInquiry(form);
      toast.success("Inquiry sent! We'll contact you within 24 hours.");
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send inquiry");
    }
    setSending(false);
  };

  return (
    <div className="page-container py-14">
      <div className="text-center mb-12">
        <h1 className="section-heading mb-3">Get in Touch</h1>
        <p className="text-gray-600 max-w-xl mx-auto">Have questions about our courses or platform? We'd love to hear from you!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {/* Contact Details + Map */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold text-gray-900">Contact Details</h2>
            {[
              { icon: PhoneIcon, label: "Phone", value: "+91 98765 43210", color: "bg-primary-100 text-primary-600" },
              { icon: EnvelopeIcon, label: "Email", value: "hello@vidyasetu.com", color: "bg-green-100 text-green-600" },
              { icon: MapPinIcon, label: "Address", value: "Surat, Gujarat, India", color: "bg-orange-100 text-orange-600" },

            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-gray-600 text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden rounded-3xl border border-gray-200">
            <ContactMap />
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-2 card p-8">
          {sent && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 font-medium text-center">
              ✅ Your inquiry has been sent! We'll be in touch soon.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" required className="input-field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input type="email" required className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <input type="text" className="input-field" placeholder="Course inquiry, general question..." value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
              <textarea required rows={5} className="input-field" placeholder="Tell us how we can help you..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full py-3 text-base">
              {sending ? "Sending..." : "Send Inquiry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
