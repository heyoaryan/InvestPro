"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

async function getClientIp(): Promise<string> {
  try {
    const res = await fetch("/api/auth/ip");
    const data = await res.json();
    return data.ip ?? "unknown";
  } catch {
    return "unknown";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ip = await getClientIp();

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      ip,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error.startsWith("TOO_MANY_ATTEMPTS:")) {
        const seconds = parseInt(result.error.split(":")[1] ?? "900");
        const minutes = Math.ceil(seconds / 60);
        setError(`Too many attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`);
      } else {
        setError("Invalid email or password.");
      }
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest block">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full h-10 bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest block">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full h-10 bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-xl transition-colors mt-2"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mb-6">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-neutral-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="rounded-2xl bg-[#141414] border border-white/[0.07] p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="text-center text-neutral-600 text-xs mt-5">
            No account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
