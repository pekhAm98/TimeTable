"use client";
import { useDispatch, useSelector } from "react-redux";
import { setPreviewData, setPreviewSource } from "../store/previewSlice";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, FileSpreadsheet, TrainFront, CalendarDays } from "lucide-react";
import { METRO_LINES, RUN_DAY_TYPES } from "@/constants/maps";
import { useState } from "react";
import { setLineId, setUploadName, setRunDayType } from "@/store/uploadSelectionSlice";
import { useGetUploadedPreviewMutation } from "@/store/api/timetableApi";

type UploadForm = {
  name: string;
  line: number;
  day: number;
  file: File | null;
};

type ApiErrorShape = {
  data?: {
    message?: string;
  };
  error?: string;
};

function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  const apiError = error as ApiErrorShape;

  if (apiError?.data?.message) {
    return apiError.data.message;
  }

  if (apiError?.error) {
    return apiError.error;
  }

  return "Upload failed. Backend may be unavailable.";
}

export default function UploadForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const uploadSelection = useSelector((state: any) => state.uploadSelection);
  const [file, setFile] = useState<File | null>(null);

  
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
      "text/plain": [".csv"],
    },
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setFile(file);
      }
    },
    onDropRejected: () => {
      toast.error("Only CSV files are allowed");
    },
  });
  const [getUploadedPreview] = useGetUploadedPreviewMutation();
  
  //UPLOAD
  const handleUpload = async () => {
    if (!uploadSelection.uploadName) {
      toast.error("Upload name is required");
      return;
    }

    if (!uploadSelection.lineId) {
      toast.error("Please select a line");
      return;
    }

    if (!uploadSelection.runDayType) {
      toast.error("Please select run day");
      return;
    }

    if (!file) {
      toast.error("CSV file is required");
      return;
    }

    try {
      const data = new FormData();

      data.append("file", file);

      data.append("uploadName", uploadSelection.uploadName);

      data.append("lineId", uploadSelection.lineId.toString());

      data.append("runDayType", uploadSelection.runDayType.toString());

      toast.loading("Uploading timetable...", {
        id: "upload",
      });
      const result = await getUploadedPreview(data).unwrap();

      if (!result?.success || !result?.data) {
        throw new Error("Upload failed. Server did not return preview data.");
      }

      toast.success("Timetable preview generated", {
        id: "upload",
      });

      // temporary
      console.log(result);
      //store the preview in redux
      //store the preview in redux

      dispatch(setPreviewData(result.data));
      dispatch(setPreviewSource("UPLOAD"));

      router.push("/preview");
    } catch (error) {
      toast.error(getApiErrorMessage(error), {
        id: "upload",
      });
    }
  };

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
      <div className="mb-6 flex items-center gap-3">
        <div
          className="
            flex h-12 w-12 items-center justify-center
            rounded-xl
            bg-emerald-500/10
            text-emerald-400
            shadow-[0_0_25px_rgba(16,185,129,0.4)]
          "
        >
          <UploadCloud size={28} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Upload Timetable</h2>

          <p className="text-sm text-slate-400">Upload a CSV file to preview timetable</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Upload Name */}
        <div>
          <label className="mb-2 block text-sm text-emerald-400">Upload Name</label>

          <div
            className="
              flex items-center gap-3
              rounded-xl
              border border-white/10
              bg-white/5
              px-4
              transition
              focus-within:border-emerald-400
            "
          >
            <FileSpreadsheet size={20} className="text-emerald-400" />

            <input
              placeholder="Enter upload name"
              value={uploadSelection.uploadName}
              onChange={(e) => dispatch(setUploadName(e.target.value))}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="
                w-full
                bg-transparent
                py-3
                text-white
                outline-none
                placeholder:text-slate-500
              "
            />
          </div>
        </div>

        {/* Line */}
        <div>
          <label className="mb-2 block text-sm text-emerald-400">Line</label>

          <div
            className="
          flex items-center gap-3
          rounded-xl
          border border-white/10
          bg-white/5
          px-4
        "
          >
            <TrainFront size={20} className="text-emerald-400" />

            <select
              value={uploadSelection.lineId ?? ""}
              onChange={(e) => dispatch(setLineId(Number(e.target.value)))}
              className="
            w-full
            bg-transparent
            py-3
            text-white
            outline-none
          "
            >
              <option value={""} className="bg-slate-900">
                Select Line
              </option>

              {METRO_LINES.map((line) => (
                <option key={line.id} value={line.id} className="bg-slate-900">
                  {line.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Run Day */}
        <div>
          <label className="mb-2 block text-sm text-emerald-400">Run Day</label>

          <div
            className="
              flex items-center gap-3
              rounded-xl
              border border-white/10
              bg-white/5
              px-4
            "
          >
            <CalendarDays size={20} className="text-emerald-400" />

            <select
              value={uploadSelection.runDayType ?? ""}
              onChange={(e) => dispatch(setRunDayType(Number(e.target.value)))}
              className="
                w-full
                bg-transparent
                py-3
                text-white
                outline-none
              "
            >
              <option value={""} className="bg-slate-900">
                Select Day
              </option>
              {RUN_DAY_TYPES.map((day) => (
                <option key={day.id} value={day.id} className="bg-slate-900">
                  {day.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CSV Upload */}
        {/* CSV Upload */}
        <div {...getRootProps()}>
          <label className="mb-2 block text-sm text-emerald-400">CSV File</label>

          <div
            className="
      flex cursor-pointer
      flex-col items-center justify-center
      rounded-xl
      border border-dashed
      border-emerald-500/50
      bg-emerald-500/5
      py-8
      transition
      hover:bg-emerald-500/10
    "
          >
            {file ? (
              <>
                <FileSpreadsheet
                  size={40}
                  className="
              mb-3
              text-emerald-400
              drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]
            "
                />

                <p className="text-white">{file.name}</p>

                <p className="mt-1 text-sm text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="
              mt-3
              rounded-lg
              bg-red-500/20
              px-3
              py-1
              text-sm
              text-red-400
              hover:bg-red-500/30
            "
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <UploadCloud size={35} className="mb-3 text-emerald-400" />

                <p className="text-sm text-slate-300">{isDragActive ? "Drop CSV file here" : "Drag & drop CSV file"}</p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  className="
              mt-3
              rounded-lg
              bg-emerald-500/20
              px-4
              py-2
              text-sm
              text-emerald-400
              hover:bg-emerald-500/30
            "
                >
                  Browse Files
                </button>
              </>
            )}

            <input {...getInputProps()} />
          </div>
        </div>

        {/* Submit */}
        <button
          className="
            flex w-full
            items-center justify-center gap-2
            rounded-xl
            bg-emerald-400
            py-3
            font-semibold
            text-black
            transition
            hover:bg-emerald-300
            shadow-[0_0_30px_rgba(16,185,129,0.45)]
          "
          onClick={handleUpload}
        >
          <UploadCloud size={20} />
          Upload & Preview
        </button>
      </div>
    </div>
  );
}
