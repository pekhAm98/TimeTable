"use client";

import { useState } from "react";
import { authClient } from "../src/lib/auth-client";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: session } = authClient.useSession();

  if (!session) return null;

  async function logout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <div className="relative z-50">
      {/* Profile button */}

      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-white/10
          bg-white/5
          px-3
          py-2
          backdrop-blur-xl
          transition
          hover:bg-white/10
        "
      >
        {/* Avatar */}

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            bg-cyan-500/20
            border
            border-cyan-400/30
            shadow-lg
            shadow-cyan-500/20
          "
        >
          <User size={18} className="text-cyan-300" />
        </div>

        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-white">{session.user.name}</p>

          <p className="max-w-32 truncate text-xs text-slate-400">{session.user.email}</p>
        </div>

        <ChevronDown
          size={16}
          className={`
            text-slate-400
            transition
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown */}

      {open && (
        <div
          className="
              absolute
              right-0
              top-full
              mt-3
              z-50
              w-56
              rounded-2xl
              border
              border-white/10
              bg-slate-900/95
              backdrop-blur-xl
              shadow-2xl
              shadow-black/40
              p-2
            "
        >
          <div
            className="
                border-b
                border-white/10
                px-3
                py-2
                mb-2
              "
          >
            <p className="text-sm text-white">{session.user.name}</p>

            <p className="text-xs text-slate-400">Logged in</p>
          </div>

          <button
            onClick={logout}
            className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-2
                text-sm
                text-red-300
                transition
                hover:bg-red-500/10
              "
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
