"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [operatorCode, setOperatorCode] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/operator-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            operatorCode: operatorCode.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("🔐 Login status:", response.status);
      console.log("🔐 Login response:", data);

      // ❌ Authentication failed
      if (!response.ok) {
        toast.error(
          data.message || "Invalid operator code or password"
        );

        return;
      }

      // ✅ Authentication succeeded
      toast.success(
        `Welcome, ${data.user?.name ?? "Operator"}`
      );

      // Let the Next.js proxy verify the session
      router.push("/");
    } catch (error) {
      console.error("❌ Login error:", error);

      toast.error(
        "Unable to connect to authentication server"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">
          Metro Portal
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Sign in to access timetable management
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Operator Code */}
        <div>
          <label className="text-sm text-slate-300">
            Operator Code
          </label>

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
            <span className="text-sm font-semibold text-slate-400">
              ID
            </span>

            <input
              type="text"
              value={operatorCode}
              onChange={(e) =>
                setOperatorCode(e.target.value)
              }
              placeholder="OPERATOR"
              autoComplete="username"
              className="
                w-full bg-transparent
                px-3 py-3
                text-white
                outline-none
                placeholder:text-slate-500
                uppercase
              "
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm text-slate-300">
            Password
          </label>

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
            <Lock
              size={18}
              className="text-slate-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              autoComplete="current-password"
              className="
                w-full bg-transparent
                px-3 py-3
                text-white
                outline-none
                placeholder:text-slate-500
              "
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              className="
                text-slate-400
                transition
                hover:text-white
              "
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
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
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Internal Metro Operations System
      </p>
    </div>
  );
}