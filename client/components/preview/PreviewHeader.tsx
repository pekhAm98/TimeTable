"use client";
import {  toast } from "sonner";
import { TrainFront, CalendarDays, FileSpreadsheet, Save, UploadCloud, Home } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import UnsavedChangesAlertModal from "./UnsavedChangesAlertModal";
import { usePatchPreviewByIdMutation, useSaveConfirmedPreviewMutation, usePublishPreviewMutation } from "@/store/api/timetableApi";
import { createPortal } from "react-dom";
import { setPreviewData } from "@/store/previewSlice";
import { useRouter } from "next/navigation";
const LINE_LABELS: Record<number, string> = {
  1: "Blue Line",
  2: "Green Line",
  3: "Purple Line",
  4: "Yellow Line",
  5: "Pink Line",
  6: "Orange Line",
};

const RUN_DAY_LABELS: Record<number, string> = {
  1: "Weekday",
  2: "Saturday",
  4: "Sunday",
};

interface Props {
  uploadName: string;
  lineId: number;
  runDayType: number;
  totalTrains: number;
}

type ApiErrorShape = {
  data?: {
    message?: string;
    errors?: Array<{ row?: number; field?: string; message?: string }>;
  };
  error?: string;
};

function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  const apiError = error as ApiErrorShape;

  const firstValidationError = apiError?.data?.errors?.[0];

  if (firstValidationError?.message) {
    const rowText = firstValidationError.row && firstValidationError.row > 0 ? `Row ${firstValidationError.row}: ` : "";
    return `${rowText}${firstValidationError.message}`;
  }

  if (apiError?.data?.message) {
    return apiError.data.message;
  }

  if (apiError?.error) {
    return apiError.error;
  }

  return "Failed to save draft. Backend may be unavailable.";
}

export default function PreviewHeader({ uploadName, lineId, runDayType, totalTrains }: Props) {
  const router = useRouter();
  const isDirty = useSelector((state: any) => state.preview.isDirty);
  const [showModal, setShowModal] = useState(false);
  const [patchPreviewById] = usePatchPreviewByIdMutation();
  const [saveConfirmedPreview] = useSaveConfirmedPreviewMutation();
  const [publishPreview, { isLoading: isPublishing }] = usePublishPreviewMutation();
  const preview = useSelector((state: any) => state.preview);
  const canPublish = Number(preview?.data?.previewId ?? 0) > 0;
  const dispatch = useDispatch();
  ///SAVE DRAFT
  const handleSaveDraft = async () => {
    const activePreview = preview.data;
    const effectiveUploadName = String(activePreview?.uploadName ?? uploadName ?? "").trim();
    const effectiveTimetable = Array.isArray(activePreview?.timetable) ? activePreview.timetable : [];
    const firstRowMeta = effectiveTimetable.length > 0 ? (effectiveTimetable[0] as { lineId?: number; runDayType?: number }) : undefined;
    const effectiveLineId = Number(activePreview?.lineId ?? lineId ?? firstRowMeta?.lineId ?? 0);
    const effectiveRunDayType = Number(activePreview?.runDayType ?? runDayType ?? firstRowMeta?.runDayType ?? 0);

    if (!activePreview) {
      console.error("No preview data to save");
      return;
    }

    if (!effectiveUploadName) {
      console.error("save draft -> uploadName missing", { activePreview, uploadName, lineId, runDayType });
      toast.error("Upload name is missing for this preview", { id: "save-draft" });
      return;
    }

    if (!effectiveLineId || ![1, 2, 3, 4, 5, 6].includes(effectiveLineId)) {
      console.error("save draft -> lineId missing/invalid", { activePreview, lineId, firstRowMeta });
      toast.error("Line ID is missing for this preview", { id: "save-draft" });
      return;
    }

    if (![1, 2, 4].includes(effectiveRunDayType)) {
      console.error("save draft -> runDayType missing/invalid", { activePreview, runDayType, firstRowMeta });
      toast.error("Run day type is missing for this preview", { id: "save-draft" });
      return;
    }

    console.log("save draft -> active preview:", activePreview);

    toast.loading("Saving draft...", {
      id: "save-draft",
    });

    if (activePreview.previewId) {
      try {
        const payload = {
          uploadName: effectiveUploadName,
          lineId: effectiveLineId,
          runDayType: effectiveRunDayType,
          timetable: effectiveTimetable,
        };

        const response = await patchPreviewById({ id: activePreview.previewId, data: payload }).unwrap();

        if (!response?.success) {
          throw new Error(response?.message ?? "Failed to save draft");
        }

        dispatch(setPreviewData(activePreview));
        toast.success("Draft saved successfully", {
          id: "save-draft",
        });
        router.push("/");
      } catch (error) {
        toast.error(getApiErrorMessage(error), {
          id: "save-draft",
        });
      }
    } else {
      try {
        const payload = {
          uploadName: effectiveUploadName,
          lineId: effectiveLineId,
          runDayType: effectiveRunDayType,
          timetable: effectiveTimetable,
        };

        const response = await saveConfirmedPreview(payload).unwrap();

        if (!response?.success) {
          throw new Error(response?.message ?? "Failed to save draft");
        }

        dispatch(setPreviewData(activePreview));
        toast.success("Draft saved successfully", {
          id: "save-draft",
        });
        router.push("/");
      } catch (error) {
        toast.error(getApiErrorMessage(error), {
          id: "save-draft",
        });
      }
    }

  };

  const handlePublish = async () => {
    const previewId = Number(preview?.data?.previewId ?? 0);

    if (!previewId) {
      toast.error("Save draft first before publishing", { id: "publish-preview" });
      return;
    }

    toast.loading("Publishing timetable...", { id: "publish-preview" });

    try {
      const response = await publishPreview(previewId).unwrap();

      if (!response?.success) {
        throw new Error(response?.message ?? "Failed to publish preview");
      }

      toast.success(response?.message ?? "Published successfully", { id: "publish-preview" });
      router.push("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error), { id: "publish-preview" });
    }
  };

  return (
    <div
      className="
        rounded-3xl
        border border-emerald-500/20
        bg-white/5
        p-8
        backdrop-blur-xl
        shadow-[0_0_50px_rgba(16,185,129,0.15)]
      "
    >
      {showModal &&
        createPortal(
          <UnsavedChangesAlertModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveDraft}
            onPublishWithoutSaving={() => {
              // Implement publish without saving logic here
            }}
          />,
          document.body,
        )}
      <div className="flex items-center gap-4">
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-emerald-500/10
            text-emerald-400
            shadow-[0_0_25px_rgba(16,185,129,0.4)]
          "
        >
          <FileSpreadsheet size={30} />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-emerald-400">{uploadName}</h1>

          <p className="mt-1 text-sm text-slate-400">Timetable Preview</p>
        </div>

        <div className="ml-auto flex items-center gap-3 self-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-white/10
              bg-white/5
              px-5
              text-sm
              font-semibold
              text-slate-200
              transition
              hover:bg-white/10
              hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
            "
          >
            <Home size={16} />
            Home
          </button>

         <button
  type="button"
  onClick={handleSaveDraft}
  className="
    inline-flex
    h-10
    items-center
    justify-center
    gap-2
    rounded-xl
    border border-emerald-400/40
    bg-emerald-500/10
    px-5
    text-sm
    font-semibold
    text-emerald-300
    transition
    hover:bg-emerald-500/20
    hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]
  "
>
  <Save size={16} />
  Save Draft
</button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || !canPublish}
            className="
      inline-flex
      h-10
      items-center
      justify-center
      gap-2
      rounded-xl
      border
      border-cyan-400/40
      bg-cyan-500/10
      px-5
      text-sm
      font-semibold
      text-cyan-200
      transition
      hover:bg-cyan-500/20
      hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]
      disabled:border-cyan-400/20
      disabled:bg-cyan-500/5
      disabled:text-cyan-200/50
      disabled:cursor-not-allowed
      disabled:opacity-70
    "
        title={canPublish ? "Publish preview" : "Save draft first to enable publish"}
          >
            <UploadCloud size={16} />
        {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div
        className="
          mt-6
          flex
          flex-wrap
          gap-6
          text-sm
          text-slate-300
        "
      >
        <div className="flex items-center gap-2">
          <TrainFront size={18} className="text-emerald-400" />
          {LINE_LABELS[lineId] ?? "Unknown Line"}
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-emerald-400" />
          {RUN_DAY_LABELS[runDayType] ?? "Unknown Day"}
        </div>

        <div className="flex items-center gap-2">
          🚆
          {totalTrains} Trains
        </div>
      </div>
    </div>
  );
}
