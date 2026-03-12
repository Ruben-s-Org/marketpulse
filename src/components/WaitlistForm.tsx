"use client";

import { useState } from "react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4 text-center max-w-md mx-auto">
        <p className="text-green-400 font-medium">You&apos;re on the list!</p>
        <p className="text-sm text-slate-400 mt-1">Check your inbox for a welcome email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex gap-3 justify-center max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="flex-1 bg-slate-800/80 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium px-6 py-3 rounded-lg transition-colors text-sm whitespace-nowrap"
      >
        {status === "loading" ? "Joining..." : "Join Waitlist"}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-1 absolute">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
