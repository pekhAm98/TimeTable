"use client";

import { useDispatch } from "react-redux";
import { updatePreview } from "@/store/previewSlice";
import EditableCell from "./EditableCell";
import DirectionDropdown from "./DirectionDropdown";

interface TimetableRow {
  trainId: string;
  sourceStation: string;
  destinationStation: string;
  direction: number;
  startTime: string;
  endTime: string;
}

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

  const updateCell = (rowIndex: number, field: keyof TimetableRow, value: string) => {
    const updatedTimetable = preview.timetable.map((row, index) =>
      index === rowIndex
        ? {
            ...row,
            [field]: field === "direction" ? (value === "UP" ? 0 : 1) : value,
          }
        : row,
    );

    dispatch(
      updatePreview({
        ...preview,
        timetable: updatedTimetable,
      }),
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
                key={row.trainId}
                className="
                    border-t
                    border-white/10
                    text-slate-200
                    hover:bg-white/5
                  "
              >
                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.trainId} onChange={(value) => updateCell(index, "trainId", value)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.sourceStation} onChange={(value) => updateCell(index, "sourceStation", value)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.destinationStation} onChange={(value) => updateCell(index, "destinationStation", value)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <DirectionDropdown
                    value={row.direction}
                    onChange={(value) => updateCell(index, "direction", value === 0 ? "UP" : "DOWN")}
                  />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.startTime} type="time" onChange={(value) => updateCell(index, "startTime", value)} />
                </td>

                <td className="px-8 py-4 align-middle">
                  <EditableCell value={row.endTime} type="time" onChange={(value) => updateCell(index, "endTime", value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
