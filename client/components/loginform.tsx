"use client";

import { useState } from "react";
import { authClient } from "../src/lib/auth-client";
import { Eye, EyeOff, Lock, Mail, Train } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4">
      {/* glow */}
      <div className="absolute h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <div
        className="
        relative w-full max-w-md
rounded-3xl
border border-white/10
bg-white/[0.03]
backdrop-blur-2xl
shadow-[0_0_50px_rgba(6,182,212,0.15)]
p-8
        "
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="
            mx-auto mb-4
            flex h-16 w-16 items-center justify-center
            rounded-2xl
            bg-cyan-500/20
            border border-cyan-400/30
            shadow-lg shadow-cyan-500/20
          "
          >
            <Train className="text-cyan-300" size={32} />
          </div>

          <h1 className="text-3xl font-bold text-white">Metro Portal</h1>

          <p className="mt-2 text-sm text-slate-400">Sign in to access timetable management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm text-slate-300">Email</label>

            <div
              className="
              mt-2 flex items-center
              rounded-xl
              border border-white/10
              bg-black/20
              px-4
              focus-within:border-cyan-400/50
            "
            >
              <Mail size={18} className="text-slate-400" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@metro.com"
                className="
                  w-full bg-transparent
                  px-3 py-3
                  text-white
                  outline-none
                  placeholder:text-slate-500
                "
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-slate-300">Password</label>

            <div
              className="
              mt-2 flex items-center
              rounded-xl
              border border-white/10
              bg-black/20
              px-4
              focus-within:border-cyan-400/50
            "
            >
              <Lock size={18} className="text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="
                  w-full bg-transparent
                  px-3 py-3
                  text-white
                  outline-none
                  placeholder:text-slate-500
                "
                required
              />

              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-white">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="
              mt-4
              w-full
              rounded-xl
              bg-gradient-to-r
              from-cyan-500
              to-blue-600
              py-3
              font-semibold
              text-white
              shadow-lg
              shadow-cyan-500/20
              transition
              hover:scale-[1.02]
              hover:shadow-cyan-500/40
              disabled:opacity-50
            "
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          className="
  mt-6
  text-center
  text-sm
  text-slate-400
"
        >
          Don't have an account?{" "}
          <a
            href="/register"
            className="
      text-cyan-400
      hover:text-cyan-300
      transition
    "
          >
            Register
          </a>
        </p>
        <p className="mt-8 text-center text-xs text-slate-500">Internal Metro Operations System</p>
      </div>
    </div>
  );
}
