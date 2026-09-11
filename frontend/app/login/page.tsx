"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/src/services/auth.service";
import { useAuth } from "@/src/components/AuthProvider";
import { useToast } from "@/src/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const { notify } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      setSession(res.accessToken, res.user);
      notify("success", "Login successful");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <section className="auth-brand">
        <span className="logo-mark">IM</span>
        <h2>Keep stock under control.</h2>
        <p>
          Track products, categories and quantity in one place. Status updates
          automatically when stock changes.
        </p>
      </section>
      <section className="auth-form-side">
        <form className="auth-box" onSubmit={onSubmit}>
          <h1 className="text-[26px] font-bold m-0 tracking-tight">Welcome back</h1>
          <p className="text-[#6b7280] mt-1 mb-6">Sign in to continue</p>

          {error ? <div className="field-error mb-3">{error}</div> : null}

          <div className="field">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn w-full" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>
          <p className="mt-5 mb-0 text-sm text-[#6b7280]">
            New here?{" "}
            <Link className="link" href="/register">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
