"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, CheckCircle } from "lucide-react";

export function ContactModule() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.submitContact(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 font-mono">
        <div>
          <h1 className="text-2xl font-bold text-green-500 mb-2">$ cat contact/form.txt</h1>
          <p className="text-muted-foreground">Get in touch with me</p>
        </div>

        {success && (
          <div className="border border-green-500 bg-green-500/10 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-green-400 font-semibold">Message sent successfully!</p>
              <p className="text-sm text-muted-foreground">I'll get back to you soon.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="border border-red-500 bg-red-500/10 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-green-400 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-background border border-muted rounded px-3 py-2 text-foreground focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-400 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-background border border-muted rounded px-3 py-2 text-foreground focus:border-green-500 focus:outline-none transition-colors"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-400 mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full bg-background border border-muted rounded px-3 py-2 text-foreground focus:border-green-500 focus:outline-none transition-colors"
              placeholder="What's this about?"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-green-400 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full bg-background border border-muted rounded px-3 py-2 text-foreground focus:border-green-500 focus:outline-none transition-colors resize-none"
              placeholder="Your message..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-muted disabled:text-muted-foreground text-black font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-muted text-xs text-muted-foreground space-y-1">
          <p>• Messages are stored securely</p>
          <p>• I typically respond within 24-48 hours</p>
          <p>• Rate limited to prevent spam</p>
        </div>
      </div>
    </ScrollArea>
  );
}
