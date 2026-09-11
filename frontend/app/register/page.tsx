"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/src/services/auth.service";
import { useAuth } from "@/src/components/AuthProvider";
import { useToast } from "@/src/components/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Fill all fields. Password should be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      setSession(res.accessToken, res.user);
      notify("success", "Account created");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <section className="auth-brand">
        <span className="logo-mark">IM</span>
        <h2>Set up your inventory workspace.</h2>
        <p>
          Create an account, add categories, then start managing products and
          stock levels.
        </p>
      </section>
      <section className="auth-form-side">
        <form className="auth-box" onSubmit={onSubmit}>
          <h1 className="text-[26px] font-bold m-0 tracking-tight">Create account</h1>
          <p className="text-[#6b7280] mt-1 mb-6">It only takes a minute</p>

          {error ? <div className="field-error mb-3">{error}</div> : null}

          <div className="field">
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn w-full" disabled={loading}>
            {loading ? "Please wait..." : "Register"}
          </button>
          <p className="mt-5 mb-0 text-sm text-[#6b7280]">
            Already have an account?{" "}
            <Link className="link" href="/login">
              Login
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
