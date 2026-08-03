import { api } from "./api";


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

type GetAllPreviewsResponse = {
  success: boolean;
  data: {
    data: PreviewSummary[];
  }
};

type SavePreviewPayload = {
  uploadName: string;
  lineId: number;
  runDayType: number;
  timetable: Array<Record<string, unknown>>;
};

export const timetableApi = api.injectEndpoints({
  endpoints: (builder) => ({



    getUploadedPreview: builder.mutation({
      query: (formData: FormData) => ({
        url: "/timetables/preview",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Preview"],
    }),

    getAllPreviews: builder.query<GetAllPreviewsResponse, void>({
      query: () => "/timetables/previews/all",
      providesTags: ["Preview"],
    }),
    getPreviewById: builder.query({
      query: (id: number) => `/timetables/previews/${id}`,
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

  }),
});

export const {
  useGetUploadedPreviewMutation,
  useGetAllPreviewsQuery,
  useGetPreviewByIdQuery,
  usePatchPreviewByIdMutation,
  useSaveConfirmedPreviewMutation,
} = timetableApi;