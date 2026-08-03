"use client";

import { Clock3, FileSpreadsheet, ChevronRight, Search } from "lucide-react";

import { useGetAllPreviewsQuery } from "@/store/api/timetableApi";

export const LINE_COLORS: Record<string, string> = {
  "Yellow Line": "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]",

  "Blue Line": "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]",

  "Pink Line": "text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]",

  "Purple Line": "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",

  "Orange Line": "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]",

  "Green Line": "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]",
};

export default function UploadHistory() {
  const {  data:previews, isLoading } = useGetAllPreviewsQuery();
  const history = previews?.data.data || [];

  if (isLoading) {
    return <p className="flex justify-center items-center">Loading...</p>;
  }

  return (
    <div
      className="
        rounded-2xl
        border border-emerald-500/20
        bg-black/40
        p-6
        backdrop-blur-xl
        shadow-[0_0_40px_rgba(16,185,129,0.15)]
      "
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-12 w-12 items-center justify-center
              rounded-xl
              bg-emerald-500/10
              text-emerald-400
            "
          >
            <Clock3 size={28} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Recent Uploads</h2>

            <p className="text-sm text-slate-400">Click an upload to view or edit</p>
          </div>
        </div>

        {/* Search */}
        <div
          className="
            flex items-center gap-2
            rounded-xl
            border border-white/10
            bg-white/5
            px-4
          "
        >
          <Search size={18} className="text-slate-400" />

          <input
            placeholder="Search uploads..."
            className="
              w-40
              bg-transparent
              py-2
              text-sm
              text-white
              outline-none
              placeholder:text-slate-500
            "
          />
        </div>
      </div>

      {/* Upload List */}
      <div className="space-y-4">
        {history.map((upload) => (
          <button
            key={upload.upload_id}
            className="
              group
              flex w-full
              items-center justify-between

              rounded-xl

              border border-white/10
              bg-white/5

              p-4

              text-left

              transition

              hover:border-emerald-400/40
              hover:bg-emerald-500/10
            "
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className="
                  flex h-11 w-11
                  items-center justify-center

                  rounded-xl

                  bg-emerald-500/10

                  text-emerald-400
                "
              >
                <FileSpreadsheet size={22} />
              </div>

              <div>
                <h3
                  className="
                    font-medium
                    text-white
                  "
                >
                  {upload.upload_name}
                </h3>

                <p
                  className="
                    text-sm
                    text-slate-400
                  "
                >
                  <span className={LINE_COLORS[upload.line_id] ?? "text-slate-300"}>{upload.line_id}</span>

                  {" • "}

                  {Number(upload.run_day_type) === 1
                    ? "Weekday"
                    : Number(upload.run_day_type) === 2
                    ? "Saturday"
                    : "Sunday"}
                </p>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  {upload.created_at}
                </p>
              </div>
            </div>

            <ChevronRight
              size={22}
              className="
                text-emerald-400
                transition
                group-hover:translate-x-1
              "
            />
          </button>
        ))}
      </div>
    </div>
  );
}
