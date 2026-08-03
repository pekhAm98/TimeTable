"use client";

import { Clock3, ChevronRight, FileSpreadsheet, Search, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { useDeletePreviewByIdMutation, useGetAllPreviewsQuery, useLazyGetPreviewByIdQuery } from "@/store/api/timetableApi";
import { setPreviewData, setPreviewSource } from "@/store/previewSlice";
import { toast } from "sonner";

export const LINE_COLORS: Record<string, string> = {
  "Yellow Line": "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]",
  "Blue Line": "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]",
  "Pink Line": "text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]",
  "Purple Line": "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",
  "Orange Line": "text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]",
  "Green Line": "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]",
};

const LINE_LABELS: Record<number, string> = {
  1: "Blue Line",
  2: "Green Line",
  3: "Purple Line",
  4: "Yellow Line",
  5: "Pink Line",
  6: "Orange Line",
};

function formatCreatedAt(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(parsed);
}

export default function UploadHistory() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [getPreviewById, { isLoading: isPreviewLoading }] = useLazyGetPreviewByIdQuery();
  const [deletePreviewById, { isLoading: isDeleting }] = useDeletePreviewByIdMutation();
  const { data: previews, isLoading } = useGetAllPreviewsQuery();
  const history = previews?.data || [];

  const handleUploadClick = async (upload: (typeof history)[number]) => {
    try {
      console.log("history click -> fetching preview id:", upload.upload_id);

      const result = await getPreviewById(upload.upload_id).unwrap();

      console.log("history click -> fetched preview detail:", result);

      const firstRowMeta = Array.isArray(result?.data?.timetable) && result.data.timetable.length > 0
        ? (result.data.timetable[0] as { lineId?: number; runDayType?: number })
        : undefined;

      const mergedPreview = {
        previewId: Number(result?.data?.previewId ?? upload.upload_id),
        uploadName: String(result?.data?.uploadName ?? upload.upload_name ?? "").trim(),
        lineId: Number(result?.data?.lineId ?? upload.line_id ?? firstRowMeta?.lineId ?? 0),
        runDayType: Number(result?.data?.runDayType ?? upload.run_day_type ?? firstRowMeta?.runDayType ?? 0),
        timetable: Array.isArray(result?.data?.timetable) ? result.data.timetable : [],
      };

      if (!mergedPreview.previewId) {
        console.warn("history click -> previewId missing from fetched preview:", result);
      }

      if (!mergedPreview.uploadName) {
        console.warn("history click -> uploadName missing after merge:", { result, upload });
      }

      if (!mergedPreview.lineId) {
        console.warn("history click -> lineId missing after merge:", { result, upload });
      }

      if (!mergedPreview.runDayType) {
        console.warn("history click -> runDayType missing after merge:", { result, upload });
      }

      console.log("history click -> merged preview for redux:", mergedPreview);

      dispatch(setPreviewData(mergedPreview));
      dispatch(setPreviewSource("HISTORY"));

      router.push("/preview");
    } catch (error) {
      console.error("history click -> failed to fetch preview detail for id:", upload.upload_id, error);
      // Keep the UI stable; the user can retry from the history list.
    }
  };

  const handleDeleteClick = async (upload: (typeof history)[number]) => {
    toast.loading("Deleting preview...", { id: `delete-${upload.upload_id}` });

    try {
      const response = await deletePreviewById(upload.upload_id).unwrap();

      if (!response?.success) {
        throw new Error(response?.message ?? "Failed to delete preview");
      }

      toast.success(response?.message ?? "Preview deleted", { id: `delete-${upload.upload_id}` });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete preview. Please try again.";

      toast.error(message, { id: `delete-${upload.upload_id}` });
    }
  };

  if (isLoading) {
    return <p className="flex items-center justify-center">Loading...</p>;
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

      <div className="space-y-4">
        {history.map((upload) => {
          const lineName = LINE_LABELS[Number(upload.line_id)] ?? `Line ${upload.line_id}`;

          return (
            <div
              key={upload.upload_id}
              className="
                group
                flex w-full items-stretch gap-2
                rounded-xl
                border border-white/10
                bg-white/5
                p-2
                transition
                hover:border-emerald-400/40
                hover:bg-emerald-500/10
              "
            >
              <button
                type="button"
                className="flex flex-1 items-center justify-between rounded-lg p-2 text-left"
                onClick={() => handleUploadClick(upload)}
                disabled={isPreviewLoading || isDeleting}
              >
                <div className="flex items-center gap-4">
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
                    <h3 className="font-medium text-white">{upload.upload_name}</h3>

                    <p className="text-sm text-slate-400">
                      <span className={LINE_COLORS[lineName] ?? "text-slate-300"}>{lineName}</span>

                      {" • "}

                      {Number(upload.run_day_type) === 1
                        ? "Weekday"
                        : Number(upload.run_day_type) === 2
                          ? "Saturday"
                          : "Sunday"}
                    </p>

                    <p className="text-sm font-bold text-slate-300">{formatCreatedAt(upload.created_at)}</p>
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

              <button
                type="button"
                onClick={() => handleDeleteClick(upload)}
                disabled={isDeleting || isPreviewLoading}
                className="
                  inline-flex items-center justify-center
                  rounded-lg border border-red-400/30
                  bg-red-500/10 px-3 text-red-300 transition
                  hover:bg-red-500/20
                  disabled:cursor-not-allowed disabled:opacity-70
                "
                aria-label={`Delete ${upload.upload_name}`}
                title="Delete preview"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
