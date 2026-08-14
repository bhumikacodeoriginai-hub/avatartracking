"use client";

import React, { useState } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

/**
 * Login Page for Admin Dashboard access.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-avatar-accent to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AI Office Avatar</h1>
          <p className="text-slate-400 mt-1">Admin Dashboard Login</p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="bg-slate-800 rounded-2xl border border-slate-700/50 p-8 space-y-5"
        >
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              required
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent/50 focus:ring-1 focus:ring-avatar-accent/30"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent/50 focus:ring-1 focus:ring-avatar-accent/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-avatar-accent hover:bg-avatar-accent/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-slate-500 text-xs">
            Secured with JWT + MFA for administrative access
          </p>
        </form>
      </div>
    </div>
  );
}
