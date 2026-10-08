"use client";

import type { TimetableTrain } from "@/app/createtimetable/page";
import type { Station } from "@/app/createtimetable/page";

type TimeTableGridProps = {
  stations: Station[];
  trains: TimetableTrain[];
};

export default function TimeTableGrid({ stations, trains }: TimeTableGridProps) {
  return (
    <div className="mt-4 w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Timetable</h2>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {trains.length} {trains.length === 1 ? "train" : "trains"}
          </p>
        </div>

        <div className="text-[11px] text-slate-500">
          <span className="text-cyan-400/80">A</span> Arrival
          <span className="mx-2 text-white/20">•</span>
          <span className="text-emerald-400/80">D</span> Departure
        </div>
      </div>

      {/* Grid */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-max w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              {/* Train column */}
              <th className="sticky left-0 z-20 min-w-[180px] border-r border-white/10 bg-[#080b18] px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Train</span>
              </th>

              {/* Station columns */}
              {stations.map((station, stationIndex) => (
                <th key={station.id} className="min-w-[125px] border-r border-white/10 px-3 py-3 text-center last:border-r-0">
                  <div className="text-sm font-semibold text-slate-200">{station.code}</div>

                  <div className="mt-1 text-[10px] text-slate-600">{stationIndex + 1}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {trains.map((train) => (
              <tr key={train.trainId} className="border-b border-white/[0.06] last:border-b-0">
                {/* Train */}
                <td className="sticky left-0 z-10 border-r border-white/10 bg-[#080b18] px-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-200">{train.trainName}</span>

                    <span className="mt-1 text-[10px] text-slate-500">{train.patternName}</span>

                    <span className="mt-1 text-[10px] text-slate-600">
                      {train.startStation} → {train.endStation}
                    </span>
                  </div>
                </td>

                {/* Station times */}
                {stations.map((station) => {
                  const stationTime = train.times.find((time) => time.stationCode === station.code);

                  return (
                    <td key={`${train.trainId}-${station.code}`} className="border-r border-white/[0.06] px-3 py-2 last:border-r-0">
                      {stationTime ? (
                        <div className="flex flex-col items-center gap-0.5 leading-none">
                          {/* Arrival */}
                          <div className="text-xs font-medium text-slate-200">
                            <span className="mr-1 text-[9px] text-cyan-400/70">A</span>

                            {stationTime.arrival ?? "—"}
                          </div>

                          {/* Departure */}
                          <div className="text-[11px] text-slate-500">
                            <span className="mr-1 text-[9px] text-emerald-400/60">D</span>

                            {stationTime.departure ?? "—"}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-slate-700">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
