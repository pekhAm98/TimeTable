"use client";

import React, { useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* =========================================================
   TYPES
========================================================= */

type Direction = "UP" | "DOWN";

type Station = {
  code: string;
  id: number;
};

type ServicePattern = {
  name: string;
  direction: Direction;
  travelTimes: string[];
};

type Line = {
  id: number;
  name: string;
  stations: {
    UP: Station[];
    DOWN: Station[];
  };
  patterns: {
    UP: ServicePattern[];
    DOWN: ServicePattern[];
  };
};


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
   MOCK DATA
========================================================= */

const MOCK_LINES: Line[] = [
  {
    id: 2,
    name: "Line 2",

    stations: {
      UP: [
        { code: "KHMD", id: 1 },
        { code: "KKSK", id: 2 },
        { code: "KJNN", id: 3 },
        { code: "KSJR", id: 4 },
        { code: "KKSO", id: 5 },
      ],

      DOWN: [
        { code: "KKSO", id: 5 },
        { code: "KSJR", id: 4 },
        { code: "KJNN", id: 3 },
        { code: "KKSK", id: 2 },
        { code: "KHMD", id: 1 },
      ],
    },

    patterns: {
      UP: [
        {
          name: "First Train",
          direction: "UP",
          travelTimes: [
            "00:02:30",
            "00:02:30",
            "00:03:00",
            "00:03:20",
          ],
        },
        {
          name: "Regular",
          direction: "UP",
          travelTimes: [
            "00:02:40",
            "00:02:20",
            "00:02:30",
            "00:02:30",
          ],
        },
        {
          name: "Evening Service",
          direction: "UP",
          travelTimes: [
            "00:03:20",
            "00:02:30",
            "00:02:00",
            "00:02:00",
          ],
        },
      ],

      DOWN: [
        {
          name: "Regular",
          direction: "DOWN",
          travelTimes: [
            "00:02:20",
            "00:02:20",
            "00:02:20",
            "00:02:40",
          ],
        },
        {
          name: "Evening Service",
          direction: "DOWN",
          travelTimes: [
            "00:03:20",
            "00:02:30",
            "00:02:00",
            "00:02:00",
          ],
        },
      ],
    },
  },

  {
    id: 3,
    name: "Line 3",

    stations: {
      UP: [
        { code: "ST01", id: 101 },
        { code: "ST02", id: 102 },
        { code: "ST03", id: 103 },
        { code: "ST04", id: 104 },
        { code: "ST05", id: 105 },
        { code: "ST06", id: 106 },
        { code: "ST07", id: 107 },
      ],

      DOWN: [
        { code: "ST07", id: 107 },
        { code: "ST06", id: 106 },
        { code: "ST05", id: 105 },
        { code: "ST04", id: 104 },
        { code: "ST03", id: 103 },
        { code: "ST02", id: 102 },
        { code: "ST01", id: 101 },
      ],
    },

    patterns: {
      UP: [
        {
          name: "Regular",
          direction: "UP",
          travelTimes: [
            "00:02:40",
            "00:02:20",
            "00:02:30",
            "00:02:30",
            "00:02:10",
            "00:03:10",
          ],
        },
      ],

      DOWN: [
        {
          name: "Regular",
          direction: "DOWN",
          travelTimes: [
            "00:02:20",
            "00:02:20",
            "00:02:20",
            "00:02:40",
            "00:02:20",
            "00:03:20",
          ],
        },
      ],
    },
  },
];

/* =========================================================
   CONSTANTS
========================================================= */

const GLOBAL_HALT = "00:20:00";

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

/* =========================================================
   PAGE
========================================================= */

const CreateTimeTable = () => {
  /* ---------------------------------------------------------
     BASIC SELECTION
  --------------------------------------------------------- */

  const [lineId, setLineId] = useState("");

  const [direction, setDirection] = useState<
    Direction | ""
  >("");

  const [patternName, setPatternName] = useState("");

  /* ---------------------------------------------------------
     STATION SELECTION
  --------------------------------------------------------- */

  const [startStation, setStartStation] = useState("");

  const [endStation, setEndStation] = useState("");

  /* ---------------------------------------------------------
     TRAIN CONFIGURATION
  --------------------------------------------------------- */

  const [timetableMode, setTimetableMode] =
    useState<"count" | "timeframe">("count");

  const [trainCount, setTrainCount] = useState(5);

  const [startTime, setStartTime] = useState("08:00");

  const [endTime, setEndTime] = useState("12:00");

  const [frequency, setFrequency] = useState("20");

  const [trains, setTrains] = useState<TimetableTrain[]>([]);

  /* =========================================================
     SELECTED LINE
  ========================================================= */

  const selectedLine = useMemo(() => {
    return MOCK_LINES.find(
      (line) => String(line.id) === lineId
    );
  }, [lineId]);

  /* =========================================================
     STATIONS

     Backend already returns them in the correct direction.
     We therefore DO NOT reverse DOWN here.
  ========================================================= */

  const stations = useMemo(() => {
    if (!selectedLine || !direction) {
      return [];
    }

    return selectedLine.stations[direction];
  }, [selectedLine, direction]);

  /* =========================================================
     SERVICE PATTERNS
  ========================================================= */

  const patterns = useMemo(() => {
    if (!selectedLine || !direction) {
      return [];
    }

    return selectedLine.patterns[direction];
  }, [selectedLine, direction]);

  /* =========================================================
     SELECTED SERVICE PATTERN
  ========================================================= */

  const selectedPattern = useMemo(() => {
    if (!selectedLine || !direction || !patternName) {
      return null;
    }

    return selectedLine.patterns[direction].find(
      (pattern) => pattern.name === patternName
    );
  }, [
    selectedLine,
    direction,
    patternName,
  ]);

  /* =========================================================
     STATION INDEXES
  ========================================================= */

  const startIndex = useMemo(() => {
    return stations.findIndex(
      (station) => station.code === startStation
    );
  }, [stations, startStation]);

  const endIndex = useMemo(() => {
    return stations.findIndex(
      (station) => station.code === endStation
    );
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

  const stationSelectionValid =
    startIndex !== -1 &&
    endIndex !== -1 &&
    startIndex < endIndex;

  const selectionComplete =
    !!selectedLine &&
    !!direction &&
    !!selectedPattern;

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleLineChange = (
    value: string | null
  ) => {
    setLineId(value ?? "");

    setDirection("");
    setPatternName("");

    setStartStation("");
    setEndStation("");
  };

  const handleDirectionChange = (
    value: string | null
  ) => {
    const nextDirection =
      (value ?? "") as Direction | "";

    setDirection(nextDirection);

    setPatternName("");

    setStartStation("");
    setEndStation("");
  };

  const handlePatternChange = (
    value: string | null
  ) => {
    setPatternName(value ?? "");

    setStartStation("");
    setEndStation("");
  };

  const handleStartStationChange = (
    value: string | null
  ) => {
    setStartStation(value ?? "");

    /*
      End station must be selected again because
      its valid range depends on the start station.
    */
    setEndStation("");
  };

  const handleEndStationChange = (
    value: string | null
  ) => {
    setEndStation(value ?? "");
  };



  const handleAddConfiguration = (newTrains: TimetableTrain[]) => {
  setTrains((prev) => [...prev, ...newTrains]);
};

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen w-full bg-[#050714] px-4 py-5 text-white">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Timetable
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Configure the timetable and add trains.
        </p>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Line
            </label>

            <Select
              value={lineId}
              onValueChange={handleLineChange}
            >
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
                {MOCK_LINES.map((line) => (
                  <SelectItem
                    key={line.id}
                    value={String(line.id)}
                  >
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DIRECTION */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Direction
            </label>

            <Select
              value={direction}
              onValueChange={handleDirectionChange}
              disabled={!selectedLine}
            >
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
                <SelectItem value="UP">
                  UP
                </SelectItem>

                <SelectItem value="DOWN">
                  DOWN
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SERVICE PATTERN */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Service Pattern
            </label>

            <Select
              value={patternName}
              onValueChange={handlePatternChange}
              disabled={!selectedLine || !direction}
            >
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
                  <SelectItem
                    key={pattern.name}
                    value={pattern.name}
                  >
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
          <div className="flex items-center justify-between gap-6">

            {/* TITLE */}

            <div className="shrink-0">
              <h2 className="text-base font-semibold text-white">
                Add Train Configuration
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Add trains to the timetable.
              </p>
            </div>

            {/* CONFIGURATION */}

            <div className="flex flex-1 items-end justify-end gap-4">

              {/* START STATION */}

              <div>
                <p className="mb-1.5 text-xs text-slate-400">
                  Start Station
                </p>

                <Select
                  value={startStation}
                  onValueChange={
                    handleStartStationChange
                  }
                >
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
                      <SelectItem
                        key={station.id}
                        value={station.code}
                      >
                        {station.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* END STATION */}

              <div>
                <p className="mb-1.5 text-xs text-slate-400">
                  End Station
                </p>

                <Select
                  value={endStation}
                  onValueChange={
                    handleEndStationChange
                  }
                  disabled={!startStation}
                >
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
                    {availableEndStations.map(
                      (station) => (
                        <SelectItem
                          key={station.id}
                          value={station.code}
                        >
                          {station.code}
                        </SelectItem>
                      )
                    )}
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

                    ${
                      stationSelectionValid
                        ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                        : "border-red-400/20 bg-red-400/[0.06] text-red-300"
                    }
                  `}
                >
                  {stationSelectionValid
                    ? "✓ Valid"
                    : "✕ Invalid"}
                </div>
              )}

              {/* MODE */}

              <div>
                <p className="mb-1.5 text-xs text-slate-400">
                  Add timetable by
                </p>

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
                    <input
                      type="radio"
                      name="timetableMode"
                      value="count"
                      checked={
                        timetableMode === "count"
                      }
                      onChange={() =>
                        setTimetableMode("count")
                      }
                      className="h-3.5 w-3.5 accent-cyan-400"
                    />

                    Number of Trains
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                      type="radio"
                      name="timetableMode"
                      value="timeframe"
                      checked={
                        timetableMode === "timeframe"
                      }
                      onChange={() =>
                        setTimetableMode("timeframe")
                      }
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
                    <label className="mb-1 block text-xs text-slate-400">
                      Number of Trains
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={trainCount}
                      onChange={(e) =>
                        setTrainCount(
                          Number(e.target.value)
                        )
                      }
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
                    <label className="mb-1 block text-xs text-slate-400">
                      Batch Start Time
                    </label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) =>
                        setStartTime(e.target.value)
                      }
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
                    <label className="mb-1 block text-xs text-slate-400">
                      Frequency
                    </label>

                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) =>
                        setFrequency(e.target.value)
                      }
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
                    <label className="mb-1 block text-xs text-slate-400">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) =>
                        setStartTime(e.target.value)
                      }
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
                    <label className="mb-1 block text-xs text-slate-400">
                      End Time
                    </label>

                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) =>
                        setEndTime(e.target.value)
                      }
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
                    <label className="mb-1 block text-xs text-slate-400">
                      Frequency
                    </label>

                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) =>
                        setFrequency(e.target.value)
                      }
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
                onClick={()=>handleAddConfiguration(trains)}
              >
                + Add
              </button>
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

          {/* HEADER */}

          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Service Pattern
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {selectedPattern?.name} · {direction}
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Global halt:{" "}
              <span className="text-slate-300">
                {GLOBAL_HALT}
              </span>
            </div>
          </div>

          {/* =================================================
              GRAPH

              IMPORTANT:
              - Fixed station height
              - Labels absolutely positioned
              - Travel line at exact 50%
              - Travel time text centered
              - Arrow remains on travel-time section
          ================================================= */}

          <div className="w-full overflow-x-auto pb-3">
            <div className="flex min-w-max items-center px-2">

              {stations.map((station, index) => {
                const isStart =
                  index === startIndex;

                const isEnd =
                  index === endIndex;

                const isSelected =
                  stationSelectionValid &&
                  index >= startIndex &&
                  index <= endIndex;

                const isTravelSelected =
                  stationSelectionValid &&
                  index >= startIndex &&
                  index < endIndex;

                const travelTime =
                  selectedPattern?.travelTimes[index];

                return (
                  <React.Fragment key={station.id}>

                    {/* =========================================
                        STATION
                    ========================================= */}

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
                      {/* STATION RECTANGLE */}

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

                          ${
                            isSelected
                              ? "border-cyan-400/70 bg-cyan-400/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                              : "border-white/10 bg-white/[0.035] text-slate-300"
                          }

                          ${
                            isStart
                              ? "border-emerald-400/80 bg-emerald-400/10 text-emerald-200 shadow-[0_0_22px_rgba(52,211,153,0.45)]"
                              : ""
                          }

                          ${
                            isEnd
                              ? "border-violet-400/80 bg-violet-400/10 text-violet-200 shadow-[0_0_22px_rgba(167,139,250,0.45)]"
                              : ""
                          }
                        `}
                      >
                        <span className="text-sm font-semibold leading-none">
                          {station.code}
                        </span>
                      </div>

                      {/* START LABEL */}

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

                      {/* END LABEL */}

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

                    {/* =========================================
                        TRAVEL TIME

                        The entire connector has fixed height.
                        Therefore station text can never move
                        the line vertically.
                    ========================================= */}

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

                        {/* LINE */}

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

                            ${
                              isTravelSelected
                                ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                : "bg-cyan-400/20"
                            }
                          `}
                        />

                        {/* TRAVEL TIME */}

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

                              ${
                                isTravelSelected
                                  ? "bg-[#050714] text-cyan-300"
                                  : "bg-[#050714] text-slate-500"
                              }
                            `}
                          >
                            {formatTravelTime(
                              travelTime
                            )}
                          </span>
                        )}

                        {/* DIRECTION ARROW */}

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

                            ${
                              isTravelSelected
                                ? "border-l-cyan-400"
                                : "border-l-cyan-400/30"
                            }
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

                ${
                  stationSelectionValid
                    ? "border-cyan-400/15 bg-cyan-400/[0.04] text-cyan-300"
                    : "border-red-400/20 bg-red-400/[0.04] text-red-300"
                }
              `}
            >
              {stationSelectionValid ? (
                <>
                  Service runs from{" "}
                  <span className="font-semibold">
                    {startStation}
                  </span>{" "}
                  →{" "}
                  <span className="font-semibold">
                    {endStation}
                  </span>
                </>
              ) : (
                "Invalid station sequence. End station must follow the start station."
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          DEBUG / CURRENT CONFIGURATION
          Remove later when timetable grid is implemented.
      ===================================================== */}

      {selectionComplete &&
        stationSelectionValid && (
          <div
            className="
              mt-3
              hidden
              rounded-xl
              border border-white/10
              bg-white/[0.025]
              p-4
              text-xs
              text-slate-400
            "
          >
            <div>
              Line: {selectedLine?.name}
            </div>

            <div>
              Direction: {direction}
            </div>

            <div>
              Pattern: {selectedPattern?.name}
            </div>

            <div>
              Start: {startStation}
            </div>

            <div>
              End: {endStation}
            </div>

            <div>
              Mode: {timetableMode}
            </div>
          </div>
        )}
    </div>
  );
};

export default CreateTimeTable;