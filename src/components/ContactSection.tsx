"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  // Anti-spam: honeypot field
  const [honeypot, setHoneypot] = useState("");

  // Anti-spam: timestamp when form was rendered
  const renderTimeRef = useRef<number>(0);
  useEffect(() => {
    renderTimeRef.current = Date.now();
  }, []);

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!email.includes("@") || !email.split("@")[1]?.includes("."))
      newErrors.email = "Please enter a valid email address";
    if (!message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const timingMs = Date.now() - renderTimeRef.current;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          _honeypot: honeypot,
          _timing: timingMs,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send message. Please try again.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
      setHoneypot("");
      setErrors({});
      // Reset render timestamp for next submission
      renderTimeRef.current = Date.now();
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handleMessageChange = (val: string) => {
    setMessage(val);
    if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
  };

  return (
    <section id="contact" aria-label="Contact form" className="py-10 md:py-14 px-6">
      <div className="max-w-[800px] mx-auto">
        <span className="text-accent text-xs font-semibold uppercase tracking-widest">Get in touch</span>
        <h2 className="text-3xl max-sm:text-2xl font-bold mt-1 mb-8">
          Contact
        </h2>
        <div className="flex gap-12 max-md:flex-col max-md:gap-8">
          <div className="flex-1">
            <p className="leading-7 font-serif mb-6 text-base opacity-90">
              Have a question? Offers on cooperation?
              <br />
              Feel free to contact me!
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.href = `mailto:${["alfiannurusyaid19", "gmail.com"].join("@")}`;
              }}
              className="inline-block px-5 py-2.5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-dark hover:scale-105 active:scale-95 transition-all duration-200 no-underline cursor-pointer shadow-sm border-none"
            >
              Hire Me
            </button>
          </div>
          <div className="flex-1">
            {success && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 mb-4 text-sm flex items-center justify-between gap-3 animate-tab-slide shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <span>
                    <strong className="font-semibold">Thanks!</strong> Your message has been sent.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  aria-label="Close notification"
                  className="text-inherit opacity-60 hover:opacity-100 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-red-500/10 dark:bg-red-950/30 border border-red-500/30 text-red-800 dark:text-red-300 mb-4 text-sm flex items-center justify-between gap-3 animate-tab-slide shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Close error notification"
                  className="text-inherit opacity-60 hover:opacity-100 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {/* Honeypot field — invisible to users, catches bots that auto-fill all fields */}
              <div aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden -z-10 pointer-events-none" tabIndex={-1}>
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                />
              </div>
              <div>
                <label htmlFor="contact-name" className="sr-only">Name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Name"
                  maxLength={100}
                  className={`w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-md px-4 py-3 text-sm font-sans outline-none transition-all duration-200 ease-out ${
                    errors.name
                      ? "border border-red-500 ring-1 ring-red-500/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                      : "border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/50 hover:border-accent/30"
                  }`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1.5 animate-tab-slide">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="contact-email" className="sr-only">Email address</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Email address"
                  maxLength={254}
                  className={`w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-md px-4 py-3 text-sm font-sans outline-none transition-all duration-200 ease-out ${
                    errors.email
                      ? "border border-red-500 ring-1 ring-red-500/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                      : "border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/50 hover:border-accent/30"
                  }`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5 animate-tab-slide">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="contact-message" className="sr-only">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Leave a message here"
                  maxLength={1000}
                  rows={6}
                  className={`w-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] rounded-md px-4 py-3 text-sm font-sans outline-none transition-all duration-200 ease-out resize-none ${
                    errors.message
                      ? "border border-red-500 ring-1 ring-red-500/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
                      : "border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/50 hover:border-accent/30"
                  }`}
                />
                {errors.message && <p className="text-red-400 text-xs mt-1.5 animate-tab-slide">{errors.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-md bg-transparent border border-[var(--color-text-primary)]/30 text-[var(--color-text-primary)] text-sm font-medium hover:border-accent hover:text-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                    Sending...
                  </span>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
