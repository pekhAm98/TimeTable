"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock3, Loader2, Pencil, Plus, Route, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { LINE_COLORS } from "@/constants/maps";

import {
  useGetAllLinesQuery,
  useGetLineStationsQuery,
  useGetServicePatternsQuery,
  useCreateServicePatternMutation,
  useUpdateServicePatternMutation,
  useDeleteServicePatternMutation,
  type ServicePattern,
} from "@/store/api/timetableApi";

type Direction = "UP" | "DOWN";
type ModalMode = "create" | "edit" | null;

const formatTravelTime = (time: string) => {
  const parts = time.split(":");

  if (parts.length !== 3) return time;

  return `${parts[1]}:${parts[2]}`;
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;

    if (data?.message) return data.message;
  }

  if (error instanceof Error) return error.message;

  return "Something went wrong. Please try again.";
};

const isValidTravelTime = (value: string) => {
  const match = /^(\d{2,}):([0-5]\d):([0-5]\d)$/.exec(value);

  return Boolean(match);
};

const normalizeTravelTime = (value: string) => {
  const trimmed = value.trim();

  if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }

  return trimmed;
};

export default function ManageServicesPage() {
  const router = useRouter();

  // Selection
  const [lineId, setLineId] = useState("");
  const [direction, setDirection] = useState<Direction | "">("");
  const [selectedPatternId, setSelectedPatternId] = useState<number | null>(null);

  // Modal
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingPattern, setEditingPattern] = useState<ServicePattern | null>(null);
  const [patternName, setPatternName] = useState("");
  const [travelTimes, setTravelTimes] = useState<string[]>([]);

  // Queries
  const { data: lines = [], isLoading: isLoadingLines, isError: isLinesError } = useGetAllLinesQuery();

  const {
    data: stations = [],
    isLoading: isLoadingStations,
    isFetching: isFetchingStations,
    isError: isStationsError,
  } = useGetLineStationsQuery(
    {
      lineId: Number(lineId),
      direction: direction as Direction,
    },
    {
      skip: !lineId || !direction,
    },
  );

  const {
    data: patterns = [],
    isLoading: isLoadingPatterns,
    isFetching: isFetchingPatterns,
    isError: isPatternsError,
  } = useGetServicePatternsQuery(
    {
      lineId: Number(lineId),
      direction: direction as Direction,
    },
    {
      skip: !lineId || !direction,
    },
  );

  // Mutations
  const [createServicePattern, { isLoading: isCreating }] = useCreateServicePatternMutation();

  const [updateServicePattern, { isLoading: isUpdating }] = useUpdateServicePatternMutation();

  const [deleteServicePattern, { isLoading: isDeleting }] = useDeleteServicePatternMutation();

  const isSaving = isCreating || isUpdating;

  // Derived data
  const selectedLine = useMemo(() => lines.find((line) => String(line.id) === lineId), [lines, lineId]);

  const selectedPattern = useMemo(() => {
    if (!patterns.length) return null;

    return patterns.find((pattern) => pattern.id === selectedPatternId) ?? patterns[0];
  }, [patterns, selectedPatternId]);

  const lineColor = LINE_COLORS[lineId] ?? "#22d3ee";

  // Selection handlers
  const handleLineChange = (value: string | null) => {
    setLineId(value ?? "");
    setDirection("");
    setSelectedPatternId(null);
    closeModal();
  };

  const handleDirectionChange = (value: string | null) => {
    setDirection((value ?? "") as Direction | "");
    setSelectedPatternId(null);
    closeModal();
  };

  // Modal handlers
  function closeModal() {
    setModalMode(null);
    setEditingPattern(null);
    setPatternName("");
    setTravelTimes([]);
  }

  const openCreateModal = () => {
    if (!lineId || !direction) {
      toast.error("Select a line and direction first.");
      return;
    }

    if (stations.length < 2) {
      toast.error("At least two stations are required.");
      return;
    }

    setEditingPattern(null);
    setPatternName("");
    setTravelTimes(Array.from({ length: stations.length - 1 }, () => ""));
    setModalMode("create");
  };

  const openEditModal = (pattern: ServicePattern) => {
    setEditingPattern(pattern);
    setPatternName(pattern.name);

    // Ensure the form has one time for every adjacent station pair.
    setTravelTimes(Array.from({ length: Math.max(0, stations.length - 1) }, (_, index) => pattern.travelTimes[index] ?? ""));

    setModalMode("edit");
  };

  const handleTravelTimeChange = (index: number, value: string) => {
    setTravelTimes((previous) => previous.map((time, i) => (i === index ? value : time)));
  };

  // Save
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!lineId || !direction) {
      toast.error("Select a line and direction first.");
      return;
    }

    const trimmedName = patternName.trim();

    if (!trimmedName) {
      toast.error("Enter a service pattern name.");
      return;
    }

    if (trimmedName.length > 100) {
      toast.error("Pattern name cannot exceed 100 characters.");
      return;
    }

    if (stations.length < 2) {
      toast.error("At least two stations are required.");
      return;
    }

    if (travelTimes.length !== stations.length - 1) {
      toast.error("Travel times do not match the selected route.");
      return;
    }

    const normalizedTimes = travelTimes.map(normalizeTravelTime);

    const invalidIndex = normalizedTimes.findIndex((time) => !isValidTravelTime(time));

    if (invalidIndex !== -1) {
      toast.error(`Enter a valid travel time between ${stations[invalidIndex].code} and ${stations[invalidIndex + 1].code}. Use HH:MM:SS.`);
      return;
    }

    // A pattern name must be unique within this line and direction.
    const duplicate = patterns.some((pattern) => pattern.name.trim().toLowerCase() === trimmedName.toLowerCase() && pattern.id !== editingPattern?.id);

    if (duplicate) {
      toast.error("A service pattern with this name already exists.");
      return;
    }

    try {
      if (modalMode === "create") {
        await createServicePattern({
          lineId: Number(lineId),
          direction,
          serviceName: trimmedName,
          TRAVEL_TIMES: normalizedTimes,
        }).unwrap();

        toast.success("Service pattern created successfully.");
      } else if (modalMode === "edit" && editingPattern) {
        await updateServicePattern({
          lineId: Number(lineId),
          direction,
          serviceNameOld: editingPattern.name,
          serviceNameNew: trimmedName,
          TRAVEL_TIMES: normalizedTimes,
        }).unwrap();

        setSelectedPatternId(editingPattern.id);

        toast.success("Service pattern updated successfully.");
      }

      closeModal();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Delete
  const handleDelete = async (pattern: ServicePattern) => {
    const confirmed = window.confirm(`Delete the service pattern "${pattern.name}"?\n\nThis action cannot be undone.`);

    if (!confirmed) return;

    try {
      await deleteServicePattern({
        lineId: Number(lineId),
        direction: direction as Direction,
        patternName: pattern.name,
      }).unwrap();

      if (selectedPatternId === pattern.id) {
        setSelectedPatternId(null);
      }

      if (editingPattern?.id === pattern.id) {
        closeModal();
      }

      toast.success("Service pattern deleted successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isInitialLoading = isLoadingLines || isLoadingStations || isLoadingPatterns;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="mt-1 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <Route className="text-cyan-400" size={21} />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Timetable Management</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Manage Services</h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-400">Create, edit, and manage service patterns and their station-to- station travel times.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Service configuration
          </div>
        </header>

        {/* Line and direction selectors */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-white">Route configuration</h2>
            <p className="mt-1 text-sm text-slate-400">Select a line and direction to view its stations and service patterns.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Metro line</label>

              <Select value={lineId} onValueChange={handleLineChange} disabled={isLoadingLines}>
                <SelectTrigger className="h-11 border-white/10 bg-slate-900/70 text-white focus:ring-cyan-400/40">
                  <SelectValue placeholder={isLoadingLines ? "Loading lines..." : "Select a line"} />
                </SelectTrigger>

                <SelectContent>
                  {lines.map((line) => (
                    <SelectItem key={line.id} value={String(line.id)}>
                      {line.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isLinesError && <p className="text-xs text-red-400">Could not load metro lines. Please refresh and try again.</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Direction</label>

              <Select value={direction} onValueChange={handleDirectionChange} disabled={!lineId}>
                <SelectTrigger className="h-11 border-white/10 bg-slate-900/70 text-white focus:ring-cyan-400/40">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="UP">UP</SelectItem>
                  <SelectItem value="DOWN">DOWN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Main content */}
        {!lineId || !direction ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 text-center">
            <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.07] p-4">
              <Route size={30} className="text-cyan-300" />
            </div>

            <h2 className="text-lg font-semibold text-white">Choose your route</h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">Select a metro line and direction above. The route map and available service patterns will appear here.</p>
          </section>
        ) : (
          <div className="space-y-6">
            {/* Route map */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Route size={18} className="text-cyan-400" />
                    <h2 className="font-semibold text-white">Service route</h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    {selectedLine?.name ?? `Line ${lineId}`} <span className="mx-1 text-slate-600">/</span>
                    <span className={direction === "UP" ? "text-cyan-300" : "text-violet-300"}>{direction}</span>
                  </p>
                </div>

                {selectedPattern && (
                  <div className="flex max-w-full items-center gap-2 self-start rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 sm:self-auto">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    <span className="truncate text-sm font-medium text-cyan-200">{selectedPattern.name}</span>
                  </div>
                )}
              </div>

              {isFetchingStations ? (
                <div className="flex min-h-52 items-center justify-center gap-3 text-sm text-slate-400">
                  <Loader2 className="animate-spin text-cyan-400" size={20} />
                  Loading station sequence...
                </div>
              ) : isStationsError ? (
                <div className="p-8 text-center text-sm text-red-400">Could not load the stations for this route.</div>
              ) : stations.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No stations are configured for this line and direction.</div>
              ) : (
                <>
                  <div className="overflow-x-auto p-5 sm:p-7">
                    <div className="flex min-w-max items-start px-3 pb-3 pt-2">
                      {stations.map((station, index) => {
                        const travelTime = selectedPattern?.travelTimes[index];

                        const isFirst = index === 0;
                        const isLast = index === stations.length - 1;

                        return (
                          <React.Fragment key={`${station.id}-${station.code}`}>
                            <div className="flex w-24 shrink-0 flex-col items-center">
                              <div
                                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-slate-950 shadow-lg ${
                                  isFirst
                                    ? "border-emerald-400 shadow-emerald-400/20"
                                    : isLast
                                      ? "border-rose-400 shadow-rose-400/20"
                                      : "border-cyan-400 shadow-cyan-400/10"
                                       }`}
                              >
                                <span className={`h-2.5 w-2.5 rounded-full ${isFirst ? "bg-emerald-400" : isLast ? "bg-rose-400" :  "bg-cyan-400" }`} />
                              </div>

                              <span className="mt-3 max-w-24 break-words text-center text-xs font-semibold text-slate-200">{station.code}</span>

                              <span className="mt-1 text-[10px] text-slate-500">{isFirst ? "First station" : isLast ? "Last station" : `Station ${index + 1}`}</span>
                            </div>

                            {!isLast && (
                              <div className="relative mt-5 h-0.5 w-28 shrink-0 bg-white/10">
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundColor: LINE_COLORS[lineId] ?? "#22d3ee",
                                  }}
                                />

                                <div className="absolute -right-0.5 -top-[3px]">
                                  <ArrowRight
                                    size={8}
                                    style={{
                                      color: LINE_COLORS[lineId] ?? "#22d3ee",
                                    }}
                                  />
                                </div>

                                <div className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-col items-center whitespace-nowrap">
                                  <Clock3 size={12} className="mb-1 text-slate-500" />

                                  <span className="rounded-md border border-white/[0.07] bg-slate-900 px-2 py-1 text-[11px] font-medium tabular-nums text-slate-300">
                                    {travelTime ? formatTravelTime(travelTime) : "--:--"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] bg-black/10 px-4 py-3 text-xs text-slate-400 sm:px-5">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      Route endpoints
                    </span>

                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${direction === "UP" ? "bg-cyan-400" : "bg-violet-400"}`} />
                      Intermediate stations
                    </span>

                    <span className="flex items-center gap-2">
                      <Clock3 size={12} />
                      Travel time between adjacent stations
                    </span>
                  </div>
                </>
              )}
            </section>

            {/* Pattern list */}
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-white">Service patterns</h2>

                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs tabular-nums text-slate-300">{patterns.length}</span>
                  </div>

                  <p className="mt-1 text-sm text-slate-400">Select a pattern to preview it on the route map.</p>
                </div>

                <button
                  type="button"
                  onClick={openCreateModal}
                  disabled={isLoadingStations || isFetchingStations || stations.length < 2}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-400/15 to-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/50 hover:from-emerald-400/20 hover:to-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={17} />
                  Create Pattern
                </button>
              </div>

              {isLoadingPatterns || isFetchingPatterns ? (
                <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-400">
                  <Loader2 className="animate-spin text-cyan-400" size={20} />
                  Loading service patterns...
                </div>
              ) : isPatternsError ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-red-400">Could not load service patterns.</p>
                  <p className="mt-1 text-xs text-slate-500">Try selecting the direction again.</p>
                </div>
              ) : patterns.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center">
                  <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                    <Route size={25} className="text-slate-400" />
                  </div>

                  <h3 className="font-medium text-white">No service patterns yet</h3>

                  <p className="mt-2 max-w-sm text-sm text-slate-400">Create the first pattern for this line and direction by defining travel times between adjacent stations.</p>

                  <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={stations.length < 2}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-40"
                  >
                    <Plus size={16} />
                    Create first pattern
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-5">
                  {patterns.map((pattern) => {
                    const isSelected = selectedPattern?.id === pattern.id;

                    return (
                      <article
                        key={pattern.id}
                        className={`group relative min-w-0 rounded-xl border p-4 transition ${
                          isSelected ? "border-cyan-400/40 bg-cyan-400/[0.07] shadow-lg shadow-cyan-950/20" : "border-white/[0.08] bg-slate-950/30 hover:border-white/20 hover:bg-white/[0.035]"
                        }`}
                      >
                        <button type="button" onClick={() => setSelectedPatternId(pattern.id)} className="block w-full min-w-0 text-left" aria-pressed={isSelected}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className={`mt-0.5 rounded-lg border p-2 ${isSelected ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/[0.04] text-slate-400"}`}>
                                <Route size={17} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="break-words font-semibold text-slate-100">{pattern.name}</h3>

                                <p className="mt-1 text-xs text-slate-500">{pattern.travelTimes.length} travel-time segments</p>
                              </div>
                            </div>

                            {isSelected && <Check size={17} className="shrink-0 text-cyan-300" />}
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1">{direction}</span>

                            <span className="truncate">{stations.length > 0 ? `${stations[0].code} → ${stations[stations.length - 1].code}` : "Route unavailable"}</span>
                          </div>
                        </button>

                        <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
                          <span className={`text-xs ${isSelected ? "text-cyan-300" : "text-slate-500"}`}>{isSelected ? "Currently previewing" : "Preview"}</span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(pattern)}
                              aria-label={`Edit ${pattern.name}`}
                              title="Edit pattern"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-cyan-400/10 hover:text-cyan-300"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(pattern)}
                              disabled={isDeleting}
                              aria-label={`Delete ${pattern.name}`}
                              title="Delete pattern"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
                            >
                              {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              closeModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pattern-modal-title"
            className="my-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-black/50"
          >
            {/* Modal header */}
            <header className="flex items-start justify-between gap-4 border-b border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
              <div>
                <div className="mb-1 flex items-center gap-2 text-cyan-300">
                  {modalMode === "create" ? <Plus size={18} /> : <Pencil size={17} />}

                  <span className="text-xs font-semibold uppercase tracking-widest">{modalMode === "create" ? "New configuration" : "Edit configuration"}</span>
                </div>

                <h2 id="pattern-modal-title" className="text-xl font-bold text-white">
                  {modalMode === "create" ? "Create service pattern" : "Edit service pattern"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {selectedLine?.name} · {direction}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </header>

            {/* Modal form */}
            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <div className="space-y-5 overflow-y-auto p-4 sm:p-5">
                <div className="space-y-2">
                  <label htmlFor="pattern-name" className="text-sm font-medium text-slate-300">
                    Service pattern name
                  </label>

                  <input
                    id="pattern-name"
                    type="text"
                    required
                    maxLength={100}
                    value={patternName}
                    onChange={(event) => setPatternName(event.target.value)}
                    placeholder="e.g. Full Route, Short Loop"
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                  />
                </div>

                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-white">Travel times</h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Enter the travel duration between each pair of adjacent stations in HH:MM:SS format. For example, 00:03:30 means 3 minutes and 30 seconds.
                    </p>
                  </div>

                  {stations.length < 2 ? (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4 text-sm text-amber-200">
                      At least two stations must be configured before you can define a service pattern.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stations.slice(0, -1).map((station, index) => {
                        const nextStation = stations[index + 1];

                        return (
                          <div key={`${station.id}-${nextStation.id}`} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-4">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.07] px-2.5 py-1.5 text-xs font-semibold text-cyan-200">{station.code}</span>

                              <ArrowRight size={15} className="text-slate-500" />

                              <span className="rounded-lg border border-violet-400/20 bg-violet-400/[0.07] px-2.5 py-1.5 text-xs font-semibold text-violet-200">{nextStation.code}</span>
                            </div>

                            <label htmlFor={`travel-time-${index}`} className="mb-1.5 block text-xs text-slate-400">
                              Travel duration
                            </label>

                            <input
                              id={`travel-time-${index}`}
                              type="text"
                              required
                              inputMode="numeric"
                              autoComplete="off"
                              value={travelTimes[index] ?? ""}
                              onChange={(event) => handleTravelTimeChange(index, event.target.value)}
                              placeholder="00:03:30"
                              aria-describedby={`travel-time-help-${index}`}
                              className="h-10 w-full rounded-lg border border-white/10 bg-slate-900 px-3 font-mono text-sm tabular-nums text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                            />

                            <p id={`travel-time-help-${index}`} className="mt-1.5 text-[11px] text-slate-500">
                              {index + 1} of {stations.length - 1} segments
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal footer */}
              <footer className="flex flex-col-reverse gap-2 border-t border-white/[0.08] bg-white/[0.02] p-4 sm:flex-row sm:justify-end sm:p-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || stations.length < 2 || travelTimes.length !== stations.length - 1}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : modalMode === "create" ? <Plus size={16} /> : <Save size={16} />}

                  {isSaving ? "Saving..." : modalMode === "create" ? "Create Pattern" : "Save Changes"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
