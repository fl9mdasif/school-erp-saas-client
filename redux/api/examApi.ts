import type {
  TCorrectInput,
  TExam,
  TExamInput,
  TExamProgress,
  TExamStatus,
  TGradingScale,
  TGradingScaleInput,
  TMarksSaveInput,
  TMarksSheet,
  TMeritRow,
  TPaged,
  TResult,
  TResultsResponse,
} from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const ALL = { limit: 100 };

export const examApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Grading scales
    getGradingScales: build.query<TPaged<TGradingScale>, void>({
      query: () => ({ url: "/grading-scales", method: "GET", params: ALL }),
      transformResponse: withMeta<TGradingScale>,
      providesTags: [tagTypes.gradingScales],
    }),
    createGradingScale: build.mutation<TGradingScale, TGradingScaleInput>({
      query: (data) => ({ url: "/grading-scales", method: "POST", data }),
      invalidatesTags: [tagTypes.gradingScales],
    }),
    updateGradingScale: build.mutation<TGradingScale, { id: string; data: Partial<TGradingScaleInput> }>({
      query: ({ id, data }) => ({ url: `/grading-scales/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.gradingScales],
    }),
    deleteGradingScale: build.mutation<void, string>({
      query: (id) => ({ url: `/grading-scales/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.gradingScales],
    }),

    // Exams
    getExams: build.query<TPaged<TExam>, Record<string, unknown> | void>({
      query: (params) => ({ url: "/exams", method: "GET", params: { ...ALL, ...(params ?? {}) } }),
      transformResponse: withMeta<TExam>,
      providesTags: [tagTypes.exams],
    }),
    getExam: build.query<TExam, string>({
      query: (id) => ({ url: `/exams/${id}`, method: "GET" }),
      providesTags: [tagTypes.exams],
    }),
    createExam: build.mutation<TExam, TExamInput>({
      query: (data) => ({ url: "/exams", method: "POST", data }),
      invalidatesTags: [tagTypes.exams],
    }),
    updateExam: build.mutation<TExam, { id: string; data: Partial<TExamInput> }>({
      query: ({ id, data }) => ({ url: `/exams/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.exams],
    }),
    setExamStatus: build.mutation<TExam, { id: string; status: TExamStatus }>({
      query: ({ id, status }) => ({ url: `/exams/${id}/status`, method: "PATCH", data: { status } }),
      invalidatesTags: [tagTypes.exams, tagTypes.marks, tagTypes.results],
    }),

    // Marks entry
    getMarksSheet: build.query<TMarksSheet, { examId: string; classId: string; sectionId?: string; subjectId: string }>({
      query: ({ examId, ...params }) => ({ url: `/exams/${examId}/marks-sheet`, method: "GET", params }),
      providesTags: [tagTypes.marks],
    }),
    saveMarks: build.mutation<{ saved: number }, { examId: string; data: TMarksSaveInput }>({
      query: ({ examId, data }) => ({ url: `/exams/${examId}/marks`, method: "PUT", data }),
      invalidatesTags: [tagTypes.marks],
    }),
    submitMarks: build.mutation<{ submitted: number }, { examId: string; classId: string; sectionId?: string; subjectId: string }>({
      query: ({ examId, ...data }) => ({ url: `/exams/${examId}/marks/submit`, method: "POST", data }),
      invalidatesTags: [tagTypes.marks],
    }),
    unlockMarks: build.mutation<{ unlocked: number }, { examId: string; classId: string; sectionId?: string; subjectId: string }>({
      query: ({ examId, ...data }) => ({ url: `/exams/${examId}/marks/unlock`, method: "POST", data }),
      invalidatesTags: [tagTypes.marks],
    }),
    getExamProgress: build.query<TExamProgress, string>({
      query: (examId) => ({ url: `/exams/${examId}/progress`, method: "GET" }),
      providesTags: [tagTypes.marks],
    }),

    // Results
    calculateExam: build.mutation<{ calculated: number }, string>({
      query: (examId) => ({ url: `/exams/${examId}/calculate`, method: "POST" }),
      invalidatesTags: [tagTypes.results],
    }),
    getResults: build.query<TResultsResponse, { examId: string; classId?: string; sectionId?: string }>({
      query: ({ examId, ...params }) => ({ url: `/exams/${examId}/results`, method: "GET", params }),
      providesTags: [tagTypes.results],
    }),
    publishExam: build.mutation<TExam, { examId: string; forceMissingAsAbsent?: boolean }>({
      query: ({ examId, ...data }) => ({ url: `/exams/${examId}/publish`, method: "POST", data }),
      invalidatesTags: [tagTypes.exams, tagTypes.results],
    }),
    correctResult: build.mutation<TResult, { examId: string; studentId: string; data: TCorrectInput }>({
      query: ({ examId, studentId, data }) => ({ url: `/exams/${examId}/results/${studentId}/correct`, method: "POST", data }),
      invalidatesTags: [tagTypes.results],
    }),
    getMeritList: build.query<{ list: TMeritRow[] }, { examId: string; classId: string }>({
      query: ({ examId, classId }) => ({ url: `/exams/${examId}/merit-list`, method: "GET", params: { classId } }),
      providesTags: [tagTypes.results],
    }),
  }),
});

export const {
  useGetGradingScalesQuery,
  useCreateGradingScaleMutation,
  useUpdateGradingScaleMutation,
  useDeleteGradingScaleMutation,
  useGetExamsQuery,
  useGetExamQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useSetExamStatusMutation,
  useGetMarksSheetQuery,
  useSaveMarksMutation,
  useSubmitMarksMutation,
  useUnlockMarksMutation,
  useGetExamProgressQuery,
  useCalculateExamMutation,
  useGetResultsQuery,
  usePublishExamMutation,
  useCorrectResultMutation,
  useGetMeritListQuery,
} = examApi;
