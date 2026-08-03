"use client";

import { AlertTriangle, Save, UploadCloud, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onPublishWithoutSaving: () => void;
}

export default function UnsavedChangesAlertModal({
  open,
  onClose,
  onSave,
  onPublishWithoutSaving,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-xl
          rounded-3xl
          border
          border-emerald-500/20
          bg-slate-950
          p-8
          shadow-[0_0_50px_rgba(16,185,129,0.2)]
        "
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-yellow-500/10
                text-yellow-400
              "
            >
              <AlertTriangle size={30} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Unsaved Changes
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your timetable has been modified but not saved.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="mt-8 space-y-4">
          <button
            onClick={onSave}
            className="
              w-full
              rounded-2xl
              border
              border-emerald-400/30
              bg-emerald-500/10
              p-5
              text-left
              transition
              hover:bg-emerald-500/20
            "
          >
            <div className="flex items-center gap-3">
              <Save className="text-emerald-400" />

              <div>
                <h3 className="font-semibold text-emerald-300">
                  Save Draft
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Save your latest changes, then publish the timetable.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onPublishWithoutSaving}
            className="
              w-full
              rounded-2xl
              border
              border-cyan-400/30
              bg-cyan-500/10
              p-5
              text-left
              transition
              hover:bg-cyan-500/20
            "
          >
            <div className="flex items-center gap-3">
              <UploadCloud className="text-cyan-300" />

              <div>
                <h3 className="font-semibold text-cyan-200">
                  Publish Without Saving
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Publish this timetable now. Your draft will remain unchanged.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-6
              py-2.5
              text-sm
              text-slate-300
              transition
              hover:bg-white/10
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}