"use client";
import { useDispatch } from "react-redux";
import {  setPreviewData, setPreviewSource } from "../store/previewSlice";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, FileSpreadsheet, TrainFront, CalendarDays } from "lucide-react";
import { useState } from "react";
type UploadForm = {
  name: string;
  line: string;
  day: string;
  file: File | null;
};
export default function UploadForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<UploadForm>({
    name: "",
    line: "",
    day: "",
    file: null,
  });

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
        setFormData((prev) => ({ ...prev, file }));
      }
    },
    onDropRejected: () => {
      toast.error("Only CSV files are allowed");
    },
  });
  //UPLOAD
  const handleUpload = async () => {
    if (!formData.name) {
      toast.error("Upload name is required");
      return;
    }

    if (!formData.line) {
      toast.error("Please select a line");
      return;
    }

    if (!formData.day) {
      toast.error("Please select run day");
      return;
    }

    if (!formData.file) {
      toast.error("CSV file is required");
      return;
    }

    try {
      const data = new FormData();

      data.append("file", formData.file);

      data.append("uploadName", formData.name);

      data.append("lineId", formData.line);

      data.append("runDayType", formData.day);

      toast.loading("Uploading timetable...", {
        id: "upload",
      });

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/timetables/preview", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
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
      toast.error(error instanceof Error ? error.message : "Upload failed", {
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.line}
              onChange={(e) => setFormData({ ...formData, line: e.target.value })}
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

              <option value="Yellow Line" className="bg-slate-900">
                Yellow Line
              </option>

              <option value="Blue Line" className="bg-slate-900">
                Blue Line
              </option>

              <option value="Pink Line" className="bg-slate-900">
                Pink Line
              </option>

              <option value="Purple Line" className="bg-slate-900">
                Purple Line
              </option>

              <option value="Orange Line" className="bg-slate-900">
                Orange Line
              </option>

              <option value="Green Line" className="bg-slate-900">
                Green Line
              </option>
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
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
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
              <option value="Weekday" className="bg-slate-900">
                Weekday
              </option>
              <option value="Saturday" className="bg-slate-900">
                Saturday
              </option>
              <option value="Sunday" className="bg-slate-900">
                Sunday
              </option>
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
            {formData.file ? (
              <>
                <FileSpreadsheet
                  size={40}
                  className="
              mb-3
              text-emerald-400
              drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]
            "
                />

                <p className="text-white">{formData.file.name}</p>

                <p className="mt-1 text-sm text-slate-400">{(formData.file.size / 1024).toFixed(2)} KB</p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({
                      ...formData,
                      file: null,
                    });
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
