"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

// ── Admin code modal ────────────────────────────────────────────────────────
function AdminCodeModal({
  onConfirm,
  onSkip,
}: {
  onConfirm: (code: string) => void;
  onSkip: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Admin account setup</h2>
          <p className="text-sm text-neutral-400 mt-1">
            No members exist yet. Do you want to create an admin account? Enter
            the admin setup code to continue, or skip to create a regular member
            account.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Admin setup code
          </label>
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="Enter secret code"
            className="w-full h-10 bg-neutral-800 border border-neutral-700 rounded-lg px-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 h-10 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg transition-colors"
          >
            Skip — create member
          </button>
          <button
            type="button"
            onClick={() => {
              if (!code.trim()) {
                setError("Please enter the admin code");
                return;
              }
              onConfirm(code.trim());
            }}
            className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Confirm admin
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main register form ───────────────────────────────────────────────────────
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [form, setForm] = useState({ name: "", email: "", password: "", referralCode: refCode });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [pendingAdminCode, setPendingAdminCode] = useState<string | null>(null);

  // Check on mount whether any users exist yet
  useEffect(() => {
    fetch("/api/auth/register")
      .then((r) => r.json())
      .then((d) => setIsFirstUser(!d.hasUsers))
      .catch(() => {});
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // Called after the form is validated — decides whether to show modal first
  const submit = async (adminCode?: string) => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, adminCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (data.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // If this is the very first user, show the admin prompt before submitting
    if (isFirstUser) {
      setShowAdminModal(true);
      return;
    }
    await submit();
  };

  const handleAdminConfirm = async (code: string) => {
    setShowAdminModal(false);
    setPendingAdminCode(code);
    await submit(code);
  };

  const handleAdminSkip = async () => {
    setShowAdminModal(false);
    await submit(undefined);
  };

  const fields = [
    { key: "name" as const, label: "Full name", type: "text", placeholder: "John Doe" },
    { key: "email" as const, label: "Email", type: "email", placeholder: "you@example.com" },
    { key: "password" as const, label: "Password", type: "password", placeholder: "Min. 8 characters" },
    { key: "referralCode" as const, label: "Referral code", type: "text", placeholder: "Optional" },
  ];

  return (
    <>
      {showAdminModal && (
        <AdminCodeModal onConfirm={handleAdminConfirm} onSkip={handleAdminSkip} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
              {label}
            </label>
            <input
              type={type}
              value={form[key]}
              onChange={set(key)}
              required={key !== "referralCode"}
              placeholder={placeholder}
              className="w-full h-10 bg-neutral-900 border border-neutral-700 rounded-lg px-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors mt-2"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mb-6">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-neutral-500 text-sm mt-1">Start earning from day one</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <Suspense>
            <RegisterForm />
          </Suspense>
          <p className="text-center text-neutral-600 text-xs mt-5">
            Already a member?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
