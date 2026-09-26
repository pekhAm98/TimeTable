"use client";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileSpreadsheet, TrainFront, CalendarDays,CalendarPlus } from "lucide-react";
import { METRO_LINES, RUN_DAY_TYPES } from "@/constants/maps";
import { useState } from "react";
import { setCreationName, setCreationLineId, setCreationRunDayType } from "@/store/createSelectionSlice";
type CreateTimeTableForm = {
  name: string;
  line: number;
  day: number;
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

export default function CreateTimeTableForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const createSelection = useSelector((state: any) => state.createSelection);
  console.log("CURRENT REDUX STATE:", createSelection);

  

  const handleCreateTimetable = async () => {
  const data: CreateTimeTableForm = {
    name: createSelection.creationName,
    line: createSelection.lineId,
    day: createSelection.runDayType,
  };
   if(!createSelection.creationName || !createSelection.lineId || !createSelection.runDayType) {
    toast.error("Please fill all fields");
    return;
   }
   console.log("Creating timetable with data:", data);
   toast.success(`Redirecting to create timetable page....`);
   router.push("/createtimetable"); 

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
          <CalendarPlus size={28} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Create Timetable</h2>

          <p className="text-sm text-slate-400">Genrate a new timetable using provided options</p>
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
              value={createSelection.creationName}
              onChange={(e) => {  
                console.log("Input value:", e.target.value);
                dispatch(setCreationName(e.target.value));
              }}
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
              value={createSelection.lineId ?? ""}
              onChange={(e) => {
                console.log("Selected line ID:", e.target.value);
                dispatch(setCreationLineId(Number(e.target.value)))}}
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
              value={createSelection.runDayType ?? ""}
              onChange={(e) => {
                console.log("Selected run day ID:", e.target.value);
                dispatch(setCreationRunDayType(Number(e.target.value)))
              }}
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
          onClick={handleCreateTimetable}
        >
          <CalendarPlus size={20} />
          Create Timetable
        </button>
      </div>
    </div>
  );
}