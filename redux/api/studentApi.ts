import type {
  TGuardianInput,
  TImportCommit,
  TImportDryRun,
  TLoginsResult,
  TPaged,
  TStudent,
  TStudentCreateInput,
  TStudentAttendance,
  TStudentDetail,
  TStudentLedger,
  TStudentResult,
  TStudentProfileInput,
  TStudentStatus,
} from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

export const studentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStudents: build.query<TPaged<TStudent>, Record<string, unknown>>({
      query: (params) => ({ url: "/students", method: "GET", params }),
      transformResponse: withMeta<TStudent>,
      providesTags: [tagTypes.students],
    }),
    getStudent: build.query<TStudentDetail, string>({
      query: (id) => ({ url: `/students/${id}`, method: "GET" }),
      providesTags: [tagTypes.students],
    }),
    createStudent: build.mutation<TStudent, TStudentCreateInput>({
      query: (data) => ({ url: "/students", method: "POST", data }),
      invalidatesTags: [tagTypes.students, tagTypes.dashboard],
    }),
    updateStudent: build.mutation<TStudent, { id: string; data: Partial<TStudentProfileInput> }>({
      query: ({ id, data }) => ({ url: `/students/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.students],
    }),
    setStudentStatus: build.mutation<TStudent, { id: string; status: TStudentStatus }>({
      query: ({ id, status }) => ({ url: `/students/${id}/status`, method: "PATCH", data: { status } }),
      invalidatesTags: [tagTypes.students, tagTypes.dashboard],
    }),
    changeEnrolment: build.mutation<unknown, { id: string; data: { sectionId?: string; roll?: number } }>({
      query: ({ id, data }) => ({ url: `/students/${id}/enrolment`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.students],
    }),
    deleteStudent: build.mutation<unknown, string>({
      query: (id) => ({ url: `/students/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.students, tagTypes.dashboard],
    }),
    attachGuardian: build.mutation<{ guardianId: string; reused: boolean }, { id: string; data: TGuardianInput }>({
      query: ({ id, data }) => ({ url: `/students/${id}/guardians`, method: "POST", data }),
      invalidatesTags: [tagTypes.students],
    }),
    getStudentAttendance: build.query<TStudentAttendance, { id: string; from: string; to: string }>({
      query: ({ id, from, to }) => ({ url: `/attendance/report/student/${id}`, method: "GET", params: { from, to } }),
      providesTags: [tagTypes.attendance],
    }),
    getStudentLedger: build.query<TStudentLedger, string>({
      query: (id) => ({ url: `/students/${id}/ledger`, method: "GET" }),
      providesTags: [tagTypes.dues],
    }),
    getStudentResults: build.query<TStudentResult[], string>({
      query: (id) => ({ url: `/students/${id}/results`, method: "GET" }),
      providesTags: [tagTypes.results],
    }),
    importDryRun: build.mutation<TImportDryRun, File>({
      query: (file) => {
        const data = new FormData();
        data.append("file", file);
        return { url: "/students/import/dry-run", method: "POST", data };
      },
    }),
    importCommit: build.mutation<TImportCommit, string>({
      query: (jobId) => ({ url: `/students/import/${jobId}/commit`, method: "POST" }),
      invalidatesTags: [tagTypes.students, tagTypes.dashboard],
    }),
    createStudentLogins: build.mutation<TLoginsResult, { id: string; student: boolean; guardianIds: string[] }>({
      query: ({ id, ...data }) => ({ url: `/students/${id}/create-login`, method: "POST", data }),
      invalidatesTags: [tagTypes.students],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useSetStudentStatusMutation,
  useChangeEnrolmentMutation,
  useDeleteStudentMutation,
  useAttachGuardianMutation,
  useGetStudentAttendanceQuery,
  useGetStudentLedgerQuery,
  useGetStudentResultsQuery,
  useImportDryRunMutation,
  useImportCommitMutation,
  useCreateStudentLoginsMutation,
} = studentApi;
