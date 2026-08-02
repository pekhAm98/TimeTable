"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { TimetableRow } from "@/store/previewSlice";
import { updatePreview } from "@/store/previewSlice";
import { toast } from "sonner";
import EditableCell from "./EditableCell";
import DirectionDropdown from "./DirectionDropdown";

interface Props {
  preview: {
    uploadName: string;
    lineId: number;
    runDayType: number;
    timetable: TimetableRow[];
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

  dispatch(
    updatePreview({
      ...preview,
      timetable: updatedTimetable,
    })
  );
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
                  <EditableCell value={row.trainId} modified={Boolean(row.changed)} onChange={(value) => updateCell(index, "trainId", value)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.sourceStation} modified={Boolean(row.changed)} onChange={(value) => updateCell(index, "sourceStation", value)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.destinationStation} modified={Boolean(row.changed)} onChange={(value) => updateCell(index, "destinationStation", value)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <DirectionDropdown
                    value={row.direction}
                    modified={Boolean(row.changed)}
                    onChange={(value) => updateCell(index, "direction", value === 0 ? "UP" : "DOWN")}
                  />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.startTime} type="time" modified={Boolean(row.changed)} onChange={(value) => updateCell(index, "startTime", value)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.endTime} type="time" modified={Boolean(row.changed)} onChange={(value) => updateCell(index, "endTime", value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
