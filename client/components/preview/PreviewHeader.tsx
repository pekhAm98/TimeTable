"use client";
import {  toast } from "sonner";
import { TrainFront, CalendarDays, FileSpreadsheet, Save, UploadCloud } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import UnsavedChangesAlertModal from "./UnsavedChangesAlertModal";
import { usePatchPreviewByIdMutation, useSaveConfirmedPreviewMutation } from "@/store/api/timetableApi";
import { createPortal } from "react-dom";
import { setPreviewData } from "@/store/previewSlice";
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

export default function PreviewHeader({ uploadName, lineId, runDayType, totalTrains }: Props) {
  const isDirty = useSelector((state: any) => state.preview.isDirty);
  const [showModal, setShowModal] = useState(false);
  const [patchPreviewById] = usePatchPreviewByIdMutation();
  const [saveConfirmedPreview] = useSaveConfirmedPreviewMutation();
  const preview = useSelector((state: any) => state.preview);
  const dispatch = useDispatch();
  ///SAVE DRAFT
  const handleSaveDraft = async () => {
    if (!preview.data) {
      console.error("No preview data to save");
      return;
    }

    if (preview.previewId) {
      try {
        const formData = new FormData();
        formData.append("uploadName", preview.data.uploadName);
        formData.append("lineId", preview.data.lineId.toString());
        formData.append("runDayType", preview.data.runDayType.toString());
        formData.append("updatedPreview", JSON.stringify(preview.data.timetable));
        const response = await patchPreviewById({ id: preview.previewId, data: formData });
        dispatch(setPreviewData({ ...preview.data, isDirty: false, previewId: response.data.id }));
        if ('error' in response) {
          toast.error("Failed to save draft");
          return;
        }
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    } else {
      try {
        const payload = {
          uploadName: preview.data.uploadName,
          lineId: preview.data.lineId,
          runDayType: preview.data.runDayType,
          timetable: preview.data.timetable,
        };

        const response = await saveConfirmedPreview(payload);
        if ('error' in response) {
          toast.error("Failed to save draft");
          return;
        }

        dispatch(setPreviewData(preview.data));
        toast.success("Draft saved successfully");
      } catch (error) {
        toast.error("Failed to save draft");
      }
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
    "
          >
            <UploadCloud size={16} />
            Publish
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
