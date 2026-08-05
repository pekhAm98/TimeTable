import { api } from "./api";
import type { TimetableRow } from "../previewSlice";

// ///BACKEND APIS////
// // Generate preview from uploaded CSV
// POST   /api/timetables/preview

// // Get upload history (metadata only)
// GET    /api/timetables/previews/all

// // Get one saved preview by upload ID
// GET    /api/timetables/previews/:id


//router.post("/previews/save", saveConfirmedPreview);
type PreviewSummary = {
  upload_id: number;
  upload_name: string;
  line_id: number;
  run_day_type: string;
  created_by: string;
  created_at: string;
};

type RawPreviewSummary = {
  upload_id?: number;
  upload_name?: string;
  line_id?: number;
  run_day_type?: string | number;
  created_by?: string;
  created_at?: string;
  UPLOAD_ID?: number;
  UPLOAD_NAME?: string;
  LINE_ID?: number;
  RUN_DAY_TYPE?: string | number;
  CREATED_BY?: string;
  CREATED_AT?: string;
};

type GetAllPreviewsResponse = {
  success: boolean;
  data: PreviewSummary[];
};

function normalizePreviewSummary(row: RawPreviewSummary): PreviewSummary {
  return {
    upload_id: Number(row.upload_id ?? row.UPLOAD_ID ?? 0),
    upload_name: String(row.upload_name ?? row.UPLOAD_NAME ?? ""),
    line_id: Number(row.line_id ?? row.LINE_ID ?? 0),
    run_day_type: String(row.run_day_type ?? row.RUN_DAY_TYPE ?? ""),
    created_by: String(row.created_by ?? row.CREATED_BY ?? ""),
    created_at: String(row.created_at ?? row.CREATED_AT ?? ""),
  };
}

type SavePreviewPayload = {
  uploadName: string;
  lineId: number;
  runDayType: number;
  timetable: Array<Record<string, unknown>>;
};

type MutationBaseResponse = {
  success: boolean;
  message?: string;
};

type RawPreviewRow = {
  previewId?: number;
  uploadName?: string;
  lineId?: number;
  runDayType?: number | string;
  timetable?: TimetableRow[];
  created_by?: string;
  created_at?: string;
  upload_id?: number;
  upload_name?: string;
  line_id?: number;
  run_day_type?: number | string;
  timetable_data?: string;
  UPLOAD_ID?: number;
  UPLOAD_NAME?: string;
  LINE_ID?: number;
  RUN_DAY_TYPE?: number | string;
  TIMETABLE_DATA?: string;
  TIMETABLE?: TimetableRow[];
  CREATED_BY?: string;
  CREATED_AT?: string;
};

type PreviewDetailResponse = {
  success: boolean;
  data: {
    previewId: number;
    uploadName: string;
    lineId: number;
    runDayType: number;
    timetable: TimetableRow[];
  };
};

function toValidRunDayType(value: unknown): number {
  const numeric = Number(value);

  if ([1, 2, 4].includes(numeric)) {
    return numeric;
  }

  const text = String(value ?? "").trim().toUpperCase();

  if (text === "WEEKDAY") return 1;
  if (text === "SATURDAY") return 2;
  if (text === "SUNDAY") return 4;

  return 0;
}

function parseTimetableData(raw: unknown): { lineId?: number; runDayType?: number; timetable: TimetableRow[] } {
  if (Array.isArray(raw)) {
    return { timetable: raw as TimetableRow[] };
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as {
        lineId?: number;
        runDayType?: number;
        timetable?: TimetableRow[];
      };

      return {
        lineId: Number(parsed?.lineId ?? 0) || undefined,
        runDayType: toValidRunDayType(parsed?.runDayType),
        timetable: Array.isArray(parsed?.timetable) ? parsed.timetable : [],
      };
    } catch {
      return { timetable: [] };
    }
  }

  if (raw && typeof raw === "object") {
    const parsed = raw as { lineId?: number; runDayType?: number; timetable?: TimetableRow[] };

    return {
      lineId: Number(parsed?.lineId ?? 0) || undefined,
      runDayType: toValidRunDayType(parsed?.runDayType),
      timetable: Array.isArray(parsed?.timetable) ? parsed.timetable : [],
    };
  }

  return { timetable: [] };
}

function normalizePreviewDetail(row: RawPreviewRow): PreviewDetailResponse["data"] {
  const parsedFromTimetableData = parseTimetableData(row.timetable_data ?? row.TIMETABLE_DATA);
  const derivedTimetable = Array.isArray(row.timetable ?? row.TIMETABLE)
    ? (row.timetable ?? row.TIMETABLE ?? [])
    : parsedFromTimetableData.timetable;

  const derivedLineId = Number(row.lineId ?? row.line_id ?? row.LINE_ID ?? parsedFromTimetableData.lineId ?? 0);
  const derivedRunDayType = toValidRunDayType(row.runDayType ?? row.run_day_type ?? row.RUN_DAY_TYPE ?? parsedFromTimetableData.runDayType ?? 0);

  return {
    previewId: Number(row.previewId ?? row.upload_id ?? row.UPLOAD_ID ?? 0),
    uploadName: String(row.uploadName ?? row.upload_name ?? row.UPLOAD_NAME ?? ""),
    lineId: Number.isFinite(derivedLineId) ? derivedLineId : 0,
    runDayType: derivedRunDayType,
    timetable: derivedTimetable,
  };
}

type UploadedPreviewResponse = {
  success: boolean;
  data?: {
    uploadName: string;
    lineId: number;
    runDayType: number;
    timetable: TimetableRow[];
  };
  message?: string;
};

export const timetableApi = api.injectEndpoints({
  endpoints: (builder) => ({



    getUploadedPreview: builder.mutation<UploadedPreviewResponse, FormData>({
      query: (formData: FormData) => ({
        url: "/timetables/preview",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Preview"],
    }),

    getAllPreviews: builder.query<GetAllPreviewsResponse, void>({
      query: () => "/timetables/previews/all",
      transformResponse: (response: { success: boolean; data: RawPreviewSummary[] }): GetAllPreviewsResponse => ({
        success: Boolean(response?.success),
        data: Array.isArray(response?.data) ? response.data.map(normalizePreviewSummary) : [],
      }),
      providesTags: (result) => {
        const itemTags = (result?.data ?? []).map((item) => ({ type: "Preview" as const, id: item.upload_id }));
        return [{ type: "Preview" as const, id: "LIST" }, ...itemTags];
      },
    }),
    getPreviewById: builder.query<PreviewDetailResponse, number>({
      query: (id: number) => `/timetables/previews/${id}`,
      transformResponse: (response: { success: boolean; data: RawPreviewRow }): PreviewDetailResponse => ({
        success: Boolean(response?.success),
        data: normalizePreviewDetail(response?.data ?? {}),
      }),
      providesTags: (result, error, id) => [{ type: "Preview", id }],
    }),

    patchPreviewById: builder.mutation({
      query: ({ id, data }: { id: number; data: SavePreviewPayload }) => ({
        url: `/timetables/previews/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Preview", id }],
    }),
    saveConfirmedPreview: builder.mutation({
      query: (data: SavePreviewPayload) => ({
        url: "/timetables/previews/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Preview"],
    }),
    deletePreviewById: builder.mutation<MutationBaseResponse, number>({
      query: (id: number) => ({
        url: `/timetables/previews/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { queryFulfilled }) {
        console.info("[deletePreviewById] started", { id });

        try {
          const { data } = await queryFulfilled;
          console.info("[deletePreviewById] succeeded", { id, response: data });
        } catch (error) {
          console.error("[deletePreviewById] failed", { id, error });
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: "Preview", id },
        { type: "Preview", id: "LIST" },
      ],
    }),

    publishPreview: builder.mutation<MutationBaseResponse, number>({
      query: (id: number) => ({
        url: `/timetables/previews/${id}/publish`,
        method: "POST",
      }),
      async onQueryStarted(id, { queryFulfilled }) {
        console.info("[publishPreview] started", { id });

        try {
          const { data } = await queryFulfilled;
          console.info("[publishPreview] succeeded", { id, response: data });
        } catch (error) {
          console.error("[publishPreview] failed", { id, error });
        }
      },
      invalidatesTags: ["Preview"],
    }),
  }),
});

export const {
  useGetUploadedPreviewMutation,
  useGetAllPreviewsQuery,
  useLazyGetPreviewByIdQuery,
  usePatchPreviewByIdMutation,
  useSaveConfirmedPreviewMutation,
  useDeletePreviewByIdMutation,
  usePublishPreviewMutation,
} = timetableApi;