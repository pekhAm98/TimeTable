"use client";
import {  toast } from "sonner";
import { AlertCircle, ChevronDown, TrainFront, CalendarDays, FileSpreadsheet, Save, UploadCloud, Home, FilePlus2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { useGetAllPreviewsQuery, usePatchPreviewByIdMutation, useSaveConfirmedPreviewMutation, usePublishPreviewMutation } from "@/store/api/timetableApi";
import { setPreviewData } from "@/store/previewSlice";
import { useRouter } from "next/navigation";
import { LINE_LABELS, METRO_LINES, RUN_DAY_LABELS, RUN_DAY_TYPES } from "@/constants/maps";
import { createPortal } from "react-dom";

interface Props {
  uploadName: string;
  lineId: number;
  runDayType: number;
  totalTrains: number;
}

interface SaveAsValues {
  uploadName: string;
  lineId: number;
  runDayType: number;
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

interface SaveAsModalProps {
  open: boolean;
  defaultUploadName: string;
  defaultLineId: number;
  defaultRunDayType: number;
  existingUploadNames: string[];
  onClose: () => void;
  onSave: (values: SaveAsValues) => void | Promise<void>;
}

function SaveAsPreviewModal({
  open,
  defaultUploadName,
  defaultLineId,
  defaultRunDayType,
  existingUploadNames,
  onClose,
  onSave,
}: SaveAsModalProps) {
  const [uploadName, setUploadName] = useState(defaultUploadName);
  const [lineId, setLineId] = useState(defaultLineId);
  const [runDayType, setRunDayType] = useState(defaultRunDayType);

  useEffect(() => {
    if (!open) {
      return;
    }

    setUploadName(defaultUploadName);
    setLineId(defaultLineId);
    setRunDayType(defaultRunDayType);
  }, [open, defaultUploadName, defaultLineId, defaultRunDayType]);

  const normalizedName = uploadName.trim();
  const duplicateName = normalizedName.length > 0 && existingUploadNames.includes(normalizedName.toLowerCase());
  const canSave = normalizedName.length > 0 && !duplicateName && lineId > 0 && runDayType > 0;

  const lineLabel = useMemo(() => LINE_LABELS[lineId] ?? METRO_LINES.find((line) => line.id === lineId)?.name ?? "Unknown Line", [lineId]);
  const runDayLabel = useMemo(() => RUN_DAY_LABELS[runDayType] ?? RUN_DAY_TYPES.find((day) => day.id === runDayType)?.name ?? "Unknown Day", [runDayType]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-emerald-500/20 bg-slate-950 p-8 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300">
              <AlertCircle size={30} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Save As</h2>
              <p className="mt-1 text-sm text-slate-400">Create a new saved preview with optional line and run day changes.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 md:items-start">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-emerald-300">Upload Name</label>
            <input
              value={uploadName}
              onChange={(event) => setUploadName(event.target.value)}
              placeholder="Enter a new upload name"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
            />
            <div className="mt-2 text-sm text-slate-400">
              {duplicateName ? (
                <span className="text-red-300">A preview with this name already exists.</span>
              ) : (
                <span>Names should be unique across saved previews.</span>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-300">Line</label>
            <div className="relative">
              <select
                value={lineId}
                onChange={(event) => setLineId(Number(event.target.value))}
                className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 pr-12 text-white outline-none transition focus:border-emerald-400"
              >
                {METRO_LINES.map((line) => (
                  <option key={line.id} value={line.id} className="bg-slate-900">
                    {line.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <p className="mt-2 text-sm text-slate-400">Current: {lineLabel}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-emerald-300">Run Day</label>
            <div className="relative">
              <select
                value={runDayType}
                onChange={(event) => setRunDayType(Number(event.target.value))}
                className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 pr-12 text-white outline-none transition focus:border-emerald-400"
              >
                {RUN_DAY_TYPES.map((day) => (
                  <option key={day.id} value={day.id} className="bg-slate-900">
                    {day.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <p className="mt-2 text-sm text-slate-400">Current: {runDayLabel}</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canSave}
            onClick={() => void onSave({ uploadName: normalizedName, lineId, runDayType })}
            className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-6 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-amber-400/20 disabled:bg-amber-500/5 disabled:text-amber-200/50"
          >
            Save As
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function PreviewHeader({ uploadName, lineId, runDayType, totalTrains }: Props) {
  const router = useRouter();
  const isDirty = useSelector((state: any) => state.preview.isDirty);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [patchPreviewById] = usePatchPreviewByIdMutation();
  const [saveConfirmedPreview] = useSaveConfirmedPreviewMutation();
  const [publishPreview, { isLoading: isPublishing }] = usePublishPreviewMutation();
  const preview = useSelector((state: any) => state.preview);
  const canPublish = Number(preview?.data?.previewId ?? preview?.previewId ?? 0) > 0;
  const isSavedPreview = Boolean(preview?.data?.previewId ?? preview?.previewId);
  const { data: allPreviews } = useGetAllPreviewsQuery();
  const dispatch = useDispatch();

  const buildSavePayload = (overrides?: { uploadName?: string; lineId?: number; runDayType?: number }) => {
    const activePreview = preview.data;
    const effectiveUploadName = String(overrides?.uploadName ?? activePreview?.uploadName ?? uploadName ?? "").trim();
    const effectiveTimetable = Array.isArray(activePreview?.timetable) ? activePreview.timetable : [];
    const firstRowMeta = effectiveTimetable.length > 0 ? (effectiveTimetable[0] as { lineId?: number; runDayType?: number }) : undefined;
    const effectiveLineId = Number(overrides?.lineId ?? activePreview?.lineId ?? lineId ?? firstRowMeta?.lineId ?? 0);
    const effectiveRunDayType = Number(overrides?.runDayType ?? activePreview?.runDayType ?? runDayType ?? firstRowMeta?.runDayType ?? 0);

    return {
      activePreview,
      effectiveUploadName,
      effectiveTimetable,
      effectiveLineId,
      effectiveRunDayType,
      firstRowMeta,
    };
  };

  const validateSavePayload = (
    payload: ReturnType<typeof buildSavePayload>,
    toastId: string,
    errorPrefix: string,
  ) => {
    const { activePreview, effectiveUploadName, effectiveLineId, effectiveRunDayType, firstRowMeta } = payload;

    if (!activePreview) {
      console.error(`${errorPrefix} -> no preview data to save`);
      return false;
    }

    if (!effectiveUploadName) {
      console.error(`${errorPrefix} -> uploadName missing`, { activePreview, uploadName, lineId, runDayType });
      toast.error("Upload name is missing for this preview", { id: toastId });
      return false;
    }

    if (!effectiveLineId || ![1, 2, 3, 4, 5, 6].includes(effectiveLineId)) {
      console.error(`${errorPrefix} -> lineId missing/invalid`, { activePreview, lineId, firstRowMeta });
      toast.error("Line ID is missing for this preview", { id: toastId });
      return false;
    }

    if (![1, 2, 4].includes(effectiveRunDayType)) {
      console.error(`${errorPrefix} -> runDayType missing/invalid`, { activePreview, runDayType, firstRowMeta });
      toast.error("Run day type is missing for this preview", { id: toastId });
      return false;
    }

    return true;
  };

  const savePreview = async (toastId: string, overrides?: { uploadName?: string; lineId?: number; runDayType?: number }, forceCreate = false) => {
    const payload = buildSavePayload(overrides);

    if (!validateSavePayload(payload, toastId, toastId)) {
      return;
    }

    const { activePreview, effectiveUploadName, effectiveTimetable, effectiveLineId, effectiveRunDayType } = payload;

    toast.loading("Saving draft...", { id: toastId });

    try {
      const requestPayload = {
        uploadName: effectiveUploadName,
        lineId: effectiveLineId,
        runDayType: effectiveRunDayType,
        timetable: effectiveTimetable,
      };

      let savedPreviewId: number | undefined = activePreview.previewId;

      if (!forceCreate && activePreview.previewId) {
        const response = await patchPreviewById({ id: activePreview.previewId, data: requestPayload }).unwrap();

        if (!response?.success) {
          throw new Error(response?.message ?? "Failed to save draft");
        }

        savedPreviewId = Number(response?.uploadId ?? response?.previewId ?? activePreview.previewId ?? 0) || undefined;
      } else {
        const response = await saveConfirmedPreview(requestPayload).unwrap();

        if (!response?.success) {
          throw new Error(response?.message ?? "Failed to save draft");
        }

        savedPreviewId = Number(response?.uploadId ?? response?.previewId ?? activePreview.previewId ?? 0) || undefined;
      }

      dispatch(setPreviewData({
        ...activePreview,
        previewId: savedPreviewId,
      }));
      toast.success("Draft saved successfully", { id: toastId });
      router.push("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error), { id: toastId });
    }
  };

  const existingUploadNames = (allPreviews?.data ?? [])
    .map((previewSummary) => String(previewSummary.upload_name ?? "").trim().toLowerCase())
    .filter(Boolean);
  const saveAsDefaults = buildSavePayload();

  const handleSaveAs = () => {
    setShowSaveAsModal(true);
  };
  ///SAVE DRAFT
  const handleSaveDraft = async () => {
    await savePreview("save-draft");
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
      <SaveAsPreviewModal
        open={showSaveAsModal}
        defaultUploadName={saveAsDefaults.effectiveUploadName}
        defaultLineId={saveAsDefaults.effectiveLineId}
        defaultRunDayType={saveAsDefaults.effectiveRunDayType}
        existingUploadNames={existingUploadNames}
        onClose={() => setShowSaveAsModal(false)}
        onSave={async (values: SaveAsValues) => {
          const { uploadName: nextUploadName, lineId: nextLineId, runDayType: nextRunDayType } = values;
          const payload = buildSavePayload({ uploadName: nextUploadName, lineId: nextLineId, runDayType: nextRunDayType });

          if (!validateSavePayload(payload, "save-as", "save-as")) {
            return;
          }

          const existingName = nextUploadName.trim().toLowerCase();

          if (existingUploadNames.includes(existingName)) {
            toast.error("That upload name already exists", { id: "save-as" });
            return;
          }

          setShowSaveAsModal(false);

          await savePreview(
            "save-as",
            {
              uploadName: nextUploadName,
              lineId: nextLineId,
              runDayType: nextRunDayType,
            },
            true,
          );
        }}
      />
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

          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-slate-400">Timetable Preview</p>

            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                isDirty
                  ? "border-amber-400/40 bg-amber-500/10 text-amber-300"
                  : isSavedPreview
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-400/30 bg-slate-500/10 text-slate-300"
              }`}
            >
              {isDirty ? "Modified" : isSavedPreview ? "Saved" : "Unsaved"}
            </span>
          </div>
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
            onClick={handleSaveAs}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border border-amber-400/40
              bg-amber-500/10
              px-5
              text-sm
              font-semibold
              text-amber-200
              transition
              hover:bg-amber-500/20
              hover:shadow-[0_0_20px_rgba(251,191,36,0.25)]
            "
          >
            <FilePlus2 size={16} />
            Save As
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
