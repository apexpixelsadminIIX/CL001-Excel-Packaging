import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-2xl font-extrabold text-white">
            <span className="w-9 h-9 bg-leaf rounded-xl flex items-center justify-center text-white text-xs">EX</span>
            Excel <span className="text-leaf">Admin</span>
          </span>
          <p className="text-white/50 mt-3 text-sm">Content Management Dashboard</p>
        </div>
        <form onSubmit={submit} className="bg-surf rounded-jumbo p-8 md:p-10 shadow-card" data-testid="admin-login-form">
          <h1 className="text-2xl font-bold text-ink mb-6">Sign in</h1>
          {error && <div className="mb-4 text-sm text-sunset bg-sunset/10 border border-sunset/30 rounded-xl px-4 py-3" data-testid="login-error">{error}</div>}
          <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Email</label>
          <input data-testid="login-email" className="w-full bg-panel border border-line rounded-2xl px-5 py-4 mb-4 focus:outline-none focus:border-leaf" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@excelpackaging.in" />
          <label className="text-xs font-bold text-ink2 uppercase tracking-wide mb-2 block">Password</label>
          <input data-testid="login-password" type="password" className="w-full bg-panel border border-line rounded-2xl px-5 py-4 mb-6 focus:outline-none focus:border-leaf" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <button data-testid="login-submit" disabled={loading} className="w-full bg-leaf text-white py-4 rounded-2xl font-bold hover:bg-ink transition-colors disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-white/30 text-xs mt-6">Private area — authorised personnel only.</p>
      </div>
    </div>
  );
}
