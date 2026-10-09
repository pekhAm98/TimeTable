"use client";

import { useRouter } from "next/navigation";
import {
  TrainFront,
  CalendarPlus,
  ArrowRight,
  Settings2,
} from "lucide-react";

export default function CreateTimeTableForm() {
  const router = useRouter();

  const handleCreateTimetable = () => {
    router.push("/createtimetable");
  };

  const handleManageServices = () => {
    router.push("/manageservices");
  };

  return (
    <div
      className="
        rounded-2xl
        border border-emerald-500/20
        bg-black/40
        p-4 sm:p-5
        backdrop-blur-xl
        shadow-[0_0_40px_rgba(16,185,129,0.15)]
      "
    >
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="
            flex h-12 w-12 items-center justify-center
            rounded-xl
            bg-emerald-500/10
            text-emerald-400
            shadow-[0_0_25px_rgba(16,185,129,0.3)]
            p-1
          "
        >
          <TrainFront size={28} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Timetable Management
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Create timetables or manage metro service patterns.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* CREATE TIMETABLE */}
        <button
          type="button"
          onClick={handleCreateTimetable}
          className="
            group flex w-full items-center justify-between gap-4
            rounded-xl
            border border-emerald-400/25
            bg-emerald-400/[0.06]
            px-4 py-4
            text-left
            transition-all duration-200
            hover:border-emerald-400/50
            hover:bg-emerald-400/[0.10]
            hover:shadow-[0_0_24px_rgba(16,185,129,0.12)]
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-12 w-12 items-center justify-center
                rounded-xl
                border border-emerald-400/20
                bg-emerald-400/10
                text-emerald-300
                transition-colors
                group-hover:bg-emerald-400/15
                p-1
              "
            >
              <CalendarPlus size={24} />
            </div>

            <div>
              <p className="font-semibold text-white">
                Create Timetable
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Configure services and generate train schedules.
              </p>
            </div>
          </div>

          <ArrowRight
            size={20}
            className="
              shrink-0 text-emerald-300
              transition-transform duration-200
              group-hover:translate-x-1
            "
          />
        </button>

        {/* MANAGE SERVICES */}
        <button
          type="button"
          onClick={handleManageServices}
          className="
            group flex w-full items-center justify-between gap-4
            rounded-xl
            border border-cyan-400/20
            bg-cyan-400/[0.04]
            px-4 py-4
            text-left
            transition-all duration-200
            hover:border-cyan-400/40
            hover:bg-cyan-400/[0.08]
            hover:shadow-[0_0_24px_rgba(34,211,238,0.08)]
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-12 w-12 items-center justify-center
                rounded-xl
                border border-cyan-400/20
                bg-cyan-400/10
                text-cyan-300
                transition-colors
                group-hover:bg-cyan-400/15
              "
            >
              <Settings2 size={24} />
            </div>

            <div>
              <p className="font-semibold text-white">
                Manage Services
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add, edit, or delete service patterns.
              </p>
            </div>
          </div>

          <ArrowRight
            size={20}
            className="
              shrink-0 text-cyan-300
              transition-transform duration-200
              group-hover:translate-x-1
            "
          />
        </button>
      </div>
    </div>
  );
}