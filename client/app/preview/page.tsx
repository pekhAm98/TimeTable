"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store";

import PreviewHeader from "@/components/preview/PreviewHeader";
import TimetableTable from "@/components/preview/TimetableTable";

export default function PreviewPage() {
  const preview = useSelector((state: RootState) => state.preview.data);
  console.log("PreviewPage preview data stats:", preview?.status);
  if (!preview) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-black
          text-white
        "
      >
        No preview data available
      </div>
    );
  }

  return (
    <main
      className="
    min-h-screen
    bg-black
    p-8
    text-white
  "
    >
      <PreviewHeader uploadName={preview.uploadName} lineId={preview.lineId} runDayType={preview.runDayType} totalTrains={preview.timetable.length} status={preview.status} />

      <TimetableTable preview={preview} />
    </main>
  );
}
