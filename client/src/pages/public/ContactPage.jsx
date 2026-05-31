import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { publicService } from "../../services";
import { EnvelopeIcon, MapPinIcon, PhoneIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import ContactMap from "../../components/ContactMap";

const contactItems = [
  { icon: PhoneIcon, label: "Phone", value: "+91 9558453510", color: "bg-primary-100 text-primary-600" },
  { icon: EnvelopeIcon, label: "Email", value: "hello@vidyasetu.com", color: "bg-green-100 text-green-600" },
  { icon: MapPinIcon, label: "Address", value: "Surat, Gujarat, India", color: "bg-orange-100 text-orange-600" },
];

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
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="hero-grid bg-white py-16 dark:bg-gray-950">
        <div className="page-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="badge-primary mb-4">Contact Us</span>
            <h1 className="section-heading mb-3 dark:text-white">Get in Touch</h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Have questions about courses, batches, pricing, or admissions? Send a message and we will help you quickly.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="page-container py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="card space-y-5">
              <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">Contact Details</h2>
              {contactItems.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-4 rounded-xl p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card dark:border-gray-700 dark:bg-gray-800">
              <ContactMap />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="card lg:col-span-2"
          >
            {sent && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center font-medium text-green-700">
                Your inquiry has been sent. We'll be in touch soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                  <input type="text" required className="input-field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                  <input type="email" required className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input type="tel" className="input-field" placeholder="+91 9558453510" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <input type="text" className="input-field" placeholder="Course inquiry, general question..." value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
                <textarea required rows={5} className="input-field" placeholder="Tell us how we can help you..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>

              <button type="submit" disabled={sending} className="btn-primary w-full py-3 text-base">
                {sending ? "Sending..." : "Send Inquiry"}
                {!sending && <PaperAirplaneIcon className="h-5 w-5" />}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
