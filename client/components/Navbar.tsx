
import Link from "next/link";
import { Activity, TrainFront } from "lucide-react";
import UserMenu from "../components/UserMenu";

export default function Navbar() {
  return (
    <header>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              bg-emerald-500/20
              text-emerald-400
              shadow-[0_0_25px_rgba(16,185,129,0.5)]
            "
          >
            <TrainFront size={24} />
          </div>

          <h1
            className="
              text-xl font-semibold
              text-white
            "
          >
            Metro
            <span className="text-emerald-400">
              {" "}Timetable Manager
            </span>
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/logs"
            className="
              flex items-center gap-2
              rounded-lg
              border border-emerald-400/20
              bg-emerald-500/10
              px-4 py-2
              text-sm font-medium
              text-emerald-400
              transition-all duration-200
              hover:border-emerald-400/40
              hover:bg-emerald-500/20
              hover:shadow-[0_0_18px_rgba(16,185,129,0.25)]
            "
          >
            <Activity size={17} />
            Logs
          </Link>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}

