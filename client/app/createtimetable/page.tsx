"use client";

import React, { useMemo, useState } from "react";

import { LINE_ARROW_COLORS } from "@/constants/maps";
import TimeTableGrid from "@/components/ui/creationComponents/TimeTableGrid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { addTrains, clearTrains, updateNamingConfig, resetNamingConfig } from "@/store/timetableSlice";
import { GLOBAL_HALT } from "@/constants/variables";
import { toast } from "sonner";
import { useEffect } from "react";
import { useGetAllLinesQuery, useGetLineStationsQuery, useGetServicePatternsQuery } from "@/store/api/timetableApi";

/* =========================================================
   TYPES
========================================================= */

type Direction = "UP" | "DOWN";

export type Station = {
  code: string;
  id: number;
};

// type ServicePattern = {
//   name: string;
//   direction: Direction;
//   travelTimes: string[];
// };

// type Line = {
//   id: number;
//   name: string;
// };

export type TimetableTrain = {
  trainId: number;
  trainName: string;
  patternName: string;
  startStation: string;
  endStation: string;
  times: {
    stationCode: string;
    arrival: string | null;
    departure: string | null;
  }[];
};

/* =========================================================
   CONSTANTS
========================================================= */

/* =========================================================
   HELPERS
========================================================= */

const formatTravelTime = (time: string) => {
  const parts = time.split(":");

  if (parts.length !== 3) {
    return time;
  }

  return `${parts[1]}:${parts[2]}`;
};

const timeToSeconds = (time: string) => {
  const [hours, minutes, seconds = "0"] = time.split(":").map(Number);

  return hours * 3600 + minutes * 60 + Number(seconds);
};

const secondsToTime = (totalSeconds: number) => {
  const secondsInDay = 24 * 60 * 60;

  const normalizedSeconds = ((totalSeconds % secondsInDay) + secondsInDay) % secondsInDay;
  const hours = Math.floor(normalizedSeconds / 3600);
  const minutes = Math.floor((normalizedSeconds % 3600) / 60);
  const seconds = normalizedSeconds % 60;

  return [String(hours).padStart(2, "0"), String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0")].join(":");
};

const addTime = (time: string, seconds: number) => secondsToTime(timeToSeconds(time) + seconds);

const durationToSeconds = (duration: string) => {
  const [hours, minutes, seconds] = duration.split(":").map(Number);

  return hours * 3600 + minutes * 60 + seconds;
};

/* =========================================================
   PAGE
========================================================= */

const CreateTimeTable = () => {
  /* ---------------------------------------------------------
     BASIC SELECTION
  --------------------------------------------------------- */

  const [lineId, setLineId] = useState("");
  const [direction, setDirection] = useState<Direction | "">("");
  const [patternName, setPatternName] = useState("");

  /* ---------------------------------------------------------
     STATION SELECTION
  --------------------------------------------------------- */

  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");

  /* ---------------------------------------------------------
     TRAIN CONFIGURATION
  --------------------------------------------------------- */

  const [timetableMode, setTimetableMode] = useState<"count" | "timeframe">("count");

  const [trainCount, setTrainCount] = useState(5);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [frequency, setFrequency] = useState("20");
  const trains = useSelector((state: RootState) => state.timetable.trains);

  const namingConfig = useSelector((state: RootState) => state.timetable.namingConfig);

  const dispatch = useDispatch<AppDispatch>();

  /* ---------------------------------------------------------
     API DATA
  --------------------------------------------------------- */

  const { data: lines = [] } = useGetAllLinesQuery();

  const { data: stations = [] } = useGetLineStationsQuery({ lineId: Number(lineId), direction: direction as Direction }, { skip: !lineId || !direction });

  const { data: patterns = [] } = useGetServicePatternsQuery({ lineId: Number(lineId), direction: direction as Direction }, { skip: !lineId || !direction });

  const selectedLine = useMemo(() => {
    return lines.find((line) => String(line.id) === lineId);
  }, [lines, lineId]);

  const selectedPattern = useMemo(() => {
    if (!patternName) return null;

    return patterns.find((pattern) => pattern.name === patternName) ?? null;
  }, [patterns, patternName]);

  /* =========================================================
     STATION INDEXES
  ========================================================= */

  const startIndex = useMemo(() => {
    return stations.findIndex((station) => station.code === startStation);
  }, [stations, startStation]);

  const endIndex = useMemo(() => {
    return stations.findIndex((station) => station.code === endStation);
  }, [stations, endStation]);

  /* =========================================================
     END STATIONS
     
     Only stations AFTER start station.
  ========================================================= */

  const availableEndStations = useMemo(() => {
    if (startIndex === -1) {
      return [];
    }

    return stations.slice(startIndex + 1);
  }, [stations, startIndex]);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const stationSelectionValid = startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;

  const selectionComplete = !!selectedLine && !!direction && !!selectedPattern;

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleLineChange = (value: string | null) => {
    dispatch(clearTrains());
    setLineId(value ?? "");
    setDirection("");
    setPatternName("");
    setStartStation("");
    setEndStation("");
  };

  const handleDirectionChange = (value: string | null) => {
    const nextDirection = (value ?? "") as Direction | "";
    dispatch(clearTrains());
    setDirection(nextDirection);
    setPatternName("");
    setStartStation("");
    setEndStation("");
  };

  const handlePatternChange = (value: string | null) => {
    setPatternName(value ?? "");
    setStartStation("");
    setEndStation("");
  };

  const handleStartStationChange = (value: string | null) => {
    setStartStation(value ?? "");

    /*
      End station must be selected again because
      its valid range depends on the start station.
    */
    setEndStation("");
  };

  const handleEndStationChange = (value: string | null) => {
    setEndStation(value ?? "");
  };

  //RESET
 const handleReset = () => {
  dispatch(clearTrains());

  setLineId("");
  setDirection("");
  setPatternName("");
  setStartStation("");
  setEndStation("");

  setTimetableMode("count");
  setTrainCount(5);
  setStartTime("08:00");
  setEndTime("12:00");
  setFrequency("20");
};

  /* =========================================================
     GENERATE TRAIN
  ========================================================= */

  const generateTrain = (trainId: number, trainName: string, departureTime: string): TimetableTrain | null => {
    if (!selectedPattern) {
      toast.error("Please select a service pattern.");
      return null;
    }

    const routeStations = stations.slice(startIndex, endIndex + 1);

    let currentDeparture = departureTime;

    const times = routeStations.map((station, index) => {
      if (index === 0) {
        const arrival = currentDeparture;

        const departure = addTime(arrival, durationToSeconds(GLOBAL_HALT));

        currentDeparture = departure;

        return {
          stationCode: station.code,
          arrival,
          departure,
        };
      }

      const travelTimeIndex = startIndex + index - 1;
      const travelTime = selectedPattern.travelTimes[travelTimeIndex];

      if (!travelTime) {
        toast.error(`Missing travel time for ${stations[travelTimeIndex]?.code} → ${station.code}`);

        return null;
      }

      const arrival = addTime(currentDeparture, durationToSeconds(travelTime));

      if (index === routeStations.length - 1) {
        return {
          stationCode: station.code,
          arrival,
          departure: null,
        };
      }

      const departure = addTime(arrival, durationToSeconds(GLOBAL_HALT));

      currentDeparture = departure;

      return {
        stationCode: station.code,
        arrival,
        departure,
      };
    });

    if (times.some((time) => time === null)) {
      return null;
    }

    return {
      trainId,
      trainName,
      patternName: selectedPattern.name,
      startStation,
      endStation,
      times: times as TimetableTrain["times"],
    };
  };

  //CLEAR TRAINS
  const handleClearTrains = () => {
    dispatch(clearTrains());
  };
  const handleAddConfiguration = () => {
  if (!stationSelectionValid) {
    toast.error("Please select a valid station range.");
    return;
  }

  if (!selectedPattern) {
    toast.error("Please select a service pattern.");
    return;
  }

  const nextTrainId =
    trains.length > 0
      ? Math.max(...trains.map((train) => train.trainId)) + 1
      : 1;

  const newTrains: TimetableTrain[] = [];

  if (timetableMode === "count") {
    const count = Number(trainCount);
    const interval = Number(frequency);

    if (!count || count < 1) {
      toast.error("Please enter a valid train count.");
      return;
    }

    if (!interval || interval <= 0) {
      toast.error("Please enter a valid frequency.");
      return;
    }

    let sequence = namingConfig.nextSequence;

    for (let i = 0; i < count; i++) {
      const departureTime = addTime(startTime, i * interval * 60);

      const trainName = `${namingConfig.prefix.trim()}-${String(sequence).padStart(3, "0")}`;

      const train = generateTrain(
        nextTrainId + i,
        trainName,
        departureTime
      );

      if (train) {
        newTrains.push(train);
        sequence += namingConfig.increment;
      }
    }
  } else {
    const interval = Number(frequency);

    if (!interval || interval <= 0) {
      toast.error("Please enter a valid frequency.");
      return;
    }

    let currentTime = startTime;
    let trainId = nextTrainId;
    let sequence = namingConfig.nextSequence;

    while (timeToSeconds(currentTime) <= timeToSeconds(endTime)) {
      const trainName = `${namingConfig.prefix.trim()}-${String(sequence).padStart(3, "0")}`;

      const train = generateTrain(trainId, trainName, currentTime);

      if (train) {
        newTrains.push(train);
        sequence += namingConfig.increment;
      }

      trainId++;
      currentTime = addTime(currentTime, interval * 60);
    }
  }

  if (newTrains.length === 0) {
    toast.error("No trains could be generated.");
    return;
  }

  dispatch(addTrains(newTrains));

  toast.success(
    `${newTrains.length} train${newTrains.length > 1 ? "s" : ""} added successfully.`
  );
};

  /* =========================================================
     RENDER
  ========================================================= */



  useEffect(() => {
  dispatch(clearTrains());
}, [dispatch]);

  return (
    <div className="min-h-screen w-full bg-[#050714] px-4 py-5 text-white">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Create Timetable</h1>

          <p className="mt-1 text-sm text-slate-400">Configure the timetable and add trains.</p>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            className="
      h-9
      rounded-lg
      border border-white/10
      bg-white/[0.03]
      px-4
      text-sm
      font-medium
      text-slate-300
      transition
      hover:border-red-400/30
      hover:bg-red-400/[0.08]
      hover:text-red-300
    "
          >
            Reset
          </button>
        </div>
      </div>
      {/* =====================================================
          SELECTION
      ===================================================== */}

      <div
        className="
          w-full
          rounded-xl
          border border-white/10
          bg-white/[0.035]
          px-4 py-3
          shadow-[0_8px_40px_rgba(0,0,0,0.25)]
          backdrop-blur-xl
        "
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* LINE */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Line</label>

            <Select value={lineId} onValueChange={handleLineChange}>
              <SelectTrigger
                className="
                  h-10 w-full
                  border-white/15
                  bg-white/[0.04]
                  text-sm text-white
                  hover:bg-white/[0.07]
                "
              >
                <SelectValue placeholder="Select Line" />
              </SelectTrigger>

              <SelectContent>
                {lines.map((line) => (
                  <SelectItem key={line.id} value={String(line.id)}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DIRECTION */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Direction</label>

            <Select value={direction} onValueChange={handleDirectionChange} disabled={!selectedLine}>
              <SelectTrigger
                className="
                  h-10 w-full
                  border-white/15
                  bg-white/[0.04]
                  text-sm text-white
                  hover:bg-white/[0.07]
                "
              >
                <SelectValue placeholder="Select Direction" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="UP">UP</SelectItem>
                <SelectItem value="DOWN">DOWN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SERVICE PATTERN */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Service Pattern</label>

            <Select value={patternName} onValueChange={handlePatternChange} disabled={!selectedLine || !direction}>
              <SelectTrigger
                className="
                  h-10 w-full
                  border-white/15
                  bg-white/[0.04]
                  text-sm text-white
                  hover:bg-white/[0.07]
                "
              >
                <SelectValue placeholder="Select Service Pattern" />
              </SelectTrigger>

              <SelectContent>
                {patterns.map((pattern) => (
                  <SelectItem key={pattern.name} value={pattern.name}>
                    {pattern.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* =====================================================
          TRAIN CONFIGURATION
      ===================================================== */}

      {selectionComplete && (
        <div
          className="
            mt-3 w-full
            rounded-xl
            border border-white/10
            bg-white/[0.025]
            px-4 py-3
            backdrop-blur-xl
          "
        >
          {/* TRAIN NAMING CONFIGURATION */}
          <div className="rounded-2xl border border-cyan-400/15 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.04)]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">Train Naming Configuration</h3>
                <p className="mt-1 text-sm text-slate-400">Configure how train names are generated</p>
              </div>

              <button
                type="button"
                onClick={() => dispatch(resetNamingConfig())}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.07]"
              >
                Reset to Default
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* PREFIX */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">Train Prefix</label>
                <input
                  type="text"
                  value={namingConfig.prefix}
                  onChange={(e) => dispatch(updateNamingConfig({ prefix: e.target.value }))}
                  placeholder="TRAIN"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
                <p className="mt-1.5 text-xs text-slate-500">Prefix for generated train names</p>
              </div>

              {/* NEXT SEQUENCE */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">Next Sequence Number</label>
                <input
                  type="number"
                  min={1}
                  value={namingConfig.nextSequence}
                  onChange={(e) =>
                    dispatch(
                      updateNamingConfig({
                        nextSequence: Math.max(1, Number(e.target.value) || 1),
                      }),
                    )
                  }
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
                <p className="mt-1.5 text-xs text-slate-500">Starting number for the next train</p>
              </div>

              {/* INCREMENT */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">Sequence Increment</label>
                <input
                  type="number"
                  min={1}
                  value={namingConfig.increment}
                  onChange={(e) =>
                    dispatch(
                      updateNamingConfig({
                        increment: Math.max(1, Number(e.target.value) || 1),
                      }),
                    )
                  }
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                />
                <p className="mt-1.5 text-xs text-slate-500">Number added for each new train</p>
              </div>
            </div>

            {/* LIVE PREVIEW */}
            <div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
              <p className="mb-3 text-sm font-medium text-cyan-300">Preview Generated Names</p>

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }, (_, index) => {
                  const sequence = namingConfig.nextSequence + index * namingConfig.increment;

                  const name = `${namingConfig.prefix.trim()}-${String(sequence).padStart(3, "0")}`;

                  return (
                    <span key={index} className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-3 py-1.5 text-xs font-medium text-cyan-200">
                      {name}
                    </span>
                  );
                })}
                <span className="px-2 py-1.5 text-xs text-slate-500">…</span>
              </div>
            </div>
          </div>
          {/* TRAIN SERVICE CONFIGURATION */}
          <div className="mt-4 rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-950/30 via-slate-900/80 to-indigo-950/20 p-5 shadow-[0_0_30px_rgba(139,92,246,0.06)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-6">
            {/* TITLE */}

            <div className="shrink-0">
              <h2 className="text-base font-semibold text-white">Train Service Configuration</h2>

              <p className="mt-0.5 text-xs text-slate-400">Add trains to the timetable.</p>
            </div>

            {/* CONFIGURATION */}

            <div className="flex flex-1 items-end justify-end gap-4">
              {/*TRAIN NAME*/}

              {/* START STATION */}

              <div>
                <p className="mb-1.5 text-xs text-slate-400">Start Station</p>

                <Select value={startStation} onValueChange={handleStartStationChange}>
                  <SelectTrigger
                    className="
                      h-9 w-32
                      border-white/10
                      bg-white/[0.03]
                      text-sm text-white
                      hover:bg-white/[0.07]
                    "
                  >
                    <SelectValue placeholder="Start Station" />
                  </SelectTrigger>

                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.code}>
                        {station.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* END STATION */}

              <div>
                <p className="mb-1.5 text-xs text-slate-400">End Station</p>

                <Select value={endStation} onValueChange={handleEndStationChange} disabled={!startStation}>
                  <SelectTrigger
                    className="
                      h-9 w-32
                      border-white/10
                      bg-white/[0.03]
                      text-sm text-white
                      hover:bg-white/[0.07]
                    "
                  >
                    <SelectValue placeholder="End Station" />
                  </SelectTrigger>

                  <SelectContent>
                    {availableEndStations.map((station) => (
                      <SelectItem key={station.id} value={station.code}>
                        {station.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* VALIDATION */}

              {startStation && endStation && (
                <div
                  className={`
                    flex h-9 items-center
                    rounded-lg
                    border
                    px-3
                    text-xs
                    whitespace-nowrap
                    ${stationSelectionValid ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300" : "border-red-400/20 bg-red-400/[0.06] text-red-300"}
                  `}
                >
                  {stationSelectionValid ? "✓ Valid" : "✕ Invalid"}
                </div>
              )}

              {/* MODE */}

              <div>
                <p className="mb-1.5 text-xs text-slate-400">Add timetable by</p>

                <div
                  className="
                    flex h-9 items-center
                    gap-5
                    rounded-lg
                    border border-white/10
                    bg-white/[0.03]
                    px-3
                  "
                >
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input type="radio" name="timetableMode" value="count" checked={timetableMode === "count"} onChange={() => setTimetableMode("count")} className="h-3.5 w-3.5 accent-cyan-400" />
                    Number of Trains
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                      type="radio"
                      name="timetableMode"
                      value="timeframe"
                      checked={timetableMode === "timeframe"}
                      onChange={() => setTimetableMode("timeframe")}
                      className="h-3.5 w-3.5 accent-cyan-400"
                    />
                    Timeframe
                  </label>
                </div>
              </div>

              {/* COUNT MODE */}

              {timetableMode === "count" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Number of Trains</label>

                    <input
                      type="number"
                      min={1}
                      value={trainCount}
                      onChange={(e) => setTrainCount(Number(e.target.value))}
                      className="
                        h-9 w-28
                        rounded-lg
                        border border-white/10
                        bg-white/[0.04]
                        px-3
                        text-sm text-white
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Batch Start Time</label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="
                        h-9 w-28
                        rounded-lg
                        border border-white/10
                        bg-white/[0.04]
                        px-3
                        text-sm text-white
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Frequency</label>

                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="20 min"
                      className="
                        h-9 w-24
                        rounded-lg
                        border border-white/10
                        bg-white/[0.04]
                        px-3
                        text-sm text-white
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />
                  </div>
                </>
              )}

              {/* TIMEFRAME MODE */}

              {timetableMode === "timeframe" && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Start Time</label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="
                        h-9 w-28
                        rounded-lg
                        border border-white/10
                        bg-white/[0.04]
                        px-3
                        text-sm text-white
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-slate-400">End Time</label>

                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="
                        h-9 w-28
                        rounded-lg
                        border border-white/10
                        bg-white/[0.04]
                        px-3
                        text-sm text-white
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-slate-400">Frequency</label>

                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="20 min"
                      className="
                        h-9 w-24
                        rounded-lg
                        border border-white/10
                        bg-white/[0.04]
                        px-3
                        text-sm text-white
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />
                  </div>
                </>
              )}

              {/* ADD */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!stationSelectionValid}
                  className="
                  h-9
                  rounded-lg
                  border border-cyan-400/30
                  bg-cyan-400/[0.08]
                  px-4
                  text-sm
                  font-medium
                  text-cyan-300
                  transition
                  hover:border-cyan-400/50
                  hover:bg-cyan-400/[0.15]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                  onClick={handleAddConfiguration}
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={handleClearTrains}
                  className="
    h-9
    rounded-lg
    border border-white/10
    bg-white/[0.03]
    px-4
    text-sm
    font-medium
    text-slate-300
    transition
    hover:border-red-400/30
    hover:bg-red-400/[0.08]
    hover:text-red-300
  "
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SERVICE PATTERN / STATION MAP
      ===================================================== */}

      {selectionComplete && (
        <div
          className="
            mt-3 w-full
            rounded-xl
            border border-white/10
            bg-white/[0.025]
            px-4 py-3
            backdrop-blur-xl
          "
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Service Pattern</h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {selectedPattern?.name} · {direction}
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Global halt: <span className="text-slate-300">{GLOBAL_HALT}</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto pb-3">
            <div className="flex min-w-max items-center px-2">
              {stations.map((station, index) => {
                const isStart = index === startIndex;
                const isEnd = index === endIndex;

                const isSelected = stationSelectionValid && index >= startIndex && index <= endIndex;

                const isTravelSelected = stationSelectionValid && index >= startIndex && index < endIndex;

                const travelTime = selectedPattern?.travelTimes[index];

                return (
                  <React.Fragment key={station.id}>
                    <div
                      className="
                        relative
                        flex
                        h-12
                        w-28
                        shrink-0
                        items-center
                        justify-center
                      "
                    >
                      <div
                        className={`
                          relative
                          z-10
                          flex
                          h-9
                          w-full
                          items-center
                          justify-center
                          rounded-lg
                          border
                          transition-all
                          duration-300
                          ${isSelected ? "border-cyan-400/70 bg-cyan-400/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.35)]" : "border-white/10 bg-white/[0.035] text-slate-300"}
                          ${isStart ? "border-emerald-400/80 bg-emerald-400/10 text-emerald-200 shadow-[0_0_22px_rgba(52,211,153,0.45)]" : ""}
                          ${isEnd ? "border-violet-400/80 bg-violet-400/10 text-violet-200 shadow-[0_0_22px_rgba(167,139,250,0.45)]" : ""}
                        `}
                      >
                        <span className="text-sm font-semibold leading-none">{station.code}</span>
                      </div>

                      {isStart && (
                        <span
                          className="
                            absolute
                            -bottom-3
                            left-1/2
                            z-20
                            -translate-x-1/2
                            whitespace-nowrap
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-emerald-400
                          "
                        >
                          START
                        </span>
                      )}

                      {isEnd && (
                        <span
                          className="
                            absolute
                            -bottom-3
                            left-1/2
                            z-20
                            -translate-x-1/2
                            whitespace-nowrap
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-violet-400
                          "
                        >
                          END
                        </span>
                      )}
                    </div>

                    {index < stations.length - 1 && (
                      <div
                        className="
                          relative
                          flex
                          h-12
                          w-28
                          shrink-0
                          items-center
                        "
                      >
                        <div
                          className={`
                            absolute
                            left-0
                            right-0
                            top-1/2
                            h-[2px]
                            -translate-y-1/2
                            transition-all
                            duration-300
                            ${isTravelSelected ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-cyan-400/20"}
                          `}
                        />

                        {travelTime && (
                          <span
                            className={`
                              absolute
                              left-1/2
                              top-1/2
                              z-10
                              -translate-x-1/2
                              -translate-y-1/2
                              whitespace-nowrap
                              rounded
                              px-1.5
                              text-[11px]
                              font-semibold
                              leading-none
                              ${isTravelSelected ? "bg-[#050714] text-cyan-300" : "bg-[#050714] text-slate-500"}
                            `}
                          >
                            {formatTravelTime(travelTime)}
                          </span>
                        )}

                        <div
                          className={`
                            absolute
                            right-0
                            top-1/2
                            z-20
                            -translate-y-1/2
                            h-0
                            w-0
                            border-y-[4px]
                            border-l-[6px]
                            border-y-transparent
                            ${isTravelSelected ? (LINE_ARROW_COLORS[lineId] ?? "border-l-cyan-400") : "border-l-cyan-400/30"}
                          `}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* =================================================
              COVERAGE STATUS
          ================================================= */}

          {startStation && endStation && (
            <div
              className={`
                mt-2
                rounded-lg
                border
                px-3
                py-2
                text-xs
                ${stationSelectionValid ? "border-cyan-400/15 bg-cyan-400/[0.04] text-cyan-300" : "border-red-400/20 bg-red-400/[0.04] text-red-300"}
              `}
            >
              {stationSelectionValid ? (
                <>
                  Service runs from <span className="font-semibold">{startStation}</span> → <span className="font-semibold">{endStation}</span>
                </>
              ) : (
                "Invalid station sequence. End station must follow the start station."
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          TIMETABLE GRID
      ===================================================== */}

      <TimeTableGrid stations={stations} trains={trains} />
    </div>
  );
};

export default CreateTimeTable;
