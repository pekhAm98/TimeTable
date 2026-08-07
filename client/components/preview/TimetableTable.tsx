"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { TimetableRow } from "@/store/previewSlice";
import { updatePreview,setDirty } from "@/store/previewSlice";
import { toast } from "sonner";
import EditableCell from "./EditableCell";
import DirectionDropdown from "./DirectionDropdown";
import { normalizeTimeToHms } from "@/src/lib/time";
import { Trash2 } from "lucide-react";

interface Props {
  preview: {
    uploadName: string;
    lineId: number;
    runDayType: number;
    timetable: TimetableRow[];
    status: string;
  };
}

export default function TimetableTable({ preview }: Props) {
  const dispatch = useDispatch();
  const originalTimetable = useSelector((state: RootState) => state.preview.originalData?.timetable ?? []);

  const hasRowChanged = (row: TimetableRow, originalRow?: TimetableRow): boolean => {
    if (!originalRow) {
      return true;
    }

    return (
      row.trainId !== originalRow.trainId ||
      row.sourceStation !== originalRow.sourceStation ||
      row.destinationStation !== originalRow.destinationStation ||
      row.direction !== originalRow.direction ||
      row.startTime !== originalRow.startTime ||
      row.endTime !== originalRow.endTime
    );
  };

  const updateCell = (rowIndex: number, field: keyof TimetableRow, value: string) => {

  if (field === "trainId") {
    const nextTrainId = value.trim().toLowerCase();

    const hasConflict = preview.timetable.some((row, index) => {
      return index !== rowIndex && row.trainId.trim().toLowerCase() === nextTrainId;
    });

    if (hasConflict) {
      toast.error("Train ID must be unique");
      return;
    }
  }

  const updatedTimetable = preview.timetable.map((row, index) => {
    if (index !== rowIndex) {
      return row;
    }

    const newValue =
      field === "direction"
        ? value === "UP"
          ? 0
          : 1
        : field === "startTime" || field === "endTime"
          ? normalizeTimeToHms(value) ?? value
          : value;

    const updatedRow = {
      ...row,
      [field]: newValue,
    };

    const originalRow = originalTimetable[index];

    return {
      ...updatedRow,
      changed: hasRowChanged(updatedRow, originalRow),
    };
  });

  dispatch(updatePreview({ ...preview, timetable: updatedTimetable }));
};
  const deleteRow = (rowIndex: number) => {
    const updatedTimetable = preview.timetable.filter((_, index) => index !== rowIndex);
    dispatch(updatePreview({ ...preview, timetable: updatedTimetable }));
    dispatch(setDirty());
    
  };



  return (
    <div
      className="
        mt-8
        overflow-hidden
        rounded-3xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
      "
    >
      <div
        className="
        max-h-[70vh]
        overflow-auto
      "
      >
        <table className="w-full table-fixed">
          <thead
            className="
              sticky
              top-0
              z-10
              bg-black/90
              text-emerald-400
            "
          >
            <tr>
              <th className="px-8 py-4 text-left">Train ID</th>

              <th className="px-8 py-4 text-left">Source</th>

              <th className="px-8 py-4 text-left">Destination</th>

              <th className="px-8 py-4 text-left">Direction</th>

              <th className="px-8 py-4 text-left">Start</th>

              <th className="px-8 py-4 text-left">End</th>

              <th className="px-2 py-4 text-center w-20">Delete</th>
            </tr>
          </thead>

          <tbody>
            {preview.timetable.map((row, index) => (
              <tr
                key={`${row.trainId}-${index}`}
                className="
                    border-t
                    border-white/10
                    text-slate-200
                    hover:bg-white/5
                  "
              >
                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.trainId} modified={Boolean(row.changed)} onBlur={(value) => updateCell(index, "trainId", value)} new={Boolean(row.new)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.sourceStation} modified={Boolean(row.changed)} onBlur={(value) => updateCell(index, "sourceStation", value)} new={Boolean(row.new)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.destinationStation} modified={Boolean(row.changed)} onBlur={(value) => updateCell(index, "destinationStation", value)} new={Boolean(row.new)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <DirectionDropdown
                    value={row.direction}
                    modified={Boolean(row.changed)}
                    onBlur={(value) => updateCell(index, "direction", value === 0 ? "UP" : "DOWN")}
                    new={Boolean(row.new)}
                  />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.startTime} type="time" modified={Boolean(row.changed)} onBlur={(value) => updateCell(index, "startTime", value)} new={Boolean(row.new)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.endTime} type="time" modified={Boolean(row.changed)} onBlur={(value) => updateCell(index, "endTime", value)} new={Boolean(row.new)} />
                </td>
                <td className="px-4 py-4 text-center">
  <button
    type="button"
    onClick={() => deleteRow(index)}
    className="
      inline-flex h-9 w-9 items-center justify-center
      rounded-lg
      border border-red-400/30
      bg-red-500/10
      text-red-300
      transition
      hover:bg-red-500/20
      hover:text-red-200
    "
    title="Delete row"
  >
    <Trash2 size={16} />
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
