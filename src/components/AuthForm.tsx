import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, AlertTriangle, Eye, ArrowRight, Activity, Loader2 } from "lucide-react";
import { AuthResponse } from "../types";

interface AuthFormProps {
  onAuthSuccess: (auth: AuthResponse) => void;
  onClose?: () => void;
}

export default function AuthForm({ onAuthSuccess, onClose }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all standard credentials fields.");
      return;
    }
    if (password.length < 6) {
      setError("Security guideline: password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication procedure failed.");
      }

      onAuthSuccess(data as AuthResponse);
    } catch (err: any) {
      setError(err.message || "Network credentials timeout or server offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-sm bg-surface-container border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-tertiary" />

      <div className="text-center mb-6">
        <h2 className="text-headline-md font-extrabold text-on-surface tracking-tight">
          {isLogin ? "Sign In to ScanDesk" : "Deploy Your Terminal"}
        </h2>
        <p className="text-body-sm text-on-surface-variant mt-1.5">
          {isLogin ? "Unlock advanced persistent threat scans" : "Create unified security account"}
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4 p-3 bg-error-container/20 border border-error/20 rounded-lg flex gap-2 items-start text-error text-body-sm text-left"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-label-sm uppercase font-mono tracking-wider text-primary">EMAIL ADDRESS</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-4 h-4 text-on-surface-variant" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@scandesk.ai"
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-white/5 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              disabled={loading}
              id="auth-email-input"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-label-sm uppercase font-mono tracking-wider text-primary">MASTER DECRYPT KEY</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-4 h-4 text-on-surface-variant" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-white/5 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              disabled={loading}
              id="auth-password-input"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className="w-full h-11 bg-primary text-on-primary font-bold rounded-lg hover:bg-surface-tint tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isLogin ? "Decrypt Workspace" : "Provision Security Shell"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-5 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-label-md text-secondary hover:text-primary transition-colors cursor-pointer font-mono"
          disabled={loading}
        >
          {isLogin ? "CREATE AN EXPANDED ACCOUNT" : "HAVE AN ACCOUNT? LOG IN HERE"}
        </button>
      </div>
    </motion.div>
  );
}
