"use client";

import { TrainFront, CalendarDays, FileSpreadsheet } from "lucide-react";

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

export default function PreviewHeader({
  uploadName,
  lineId,
  runDayType,
  totalTrains,
}: Props) {
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
          <h1 className="text-3xl font-bold text-emerald-400">
            {uploadName}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Timetable Preview
          </p>
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