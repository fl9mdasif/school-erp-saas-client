import type {
  TClass,
  TClassInput,
  TClassSubject,
  TClassSubjectInput,
  TPaged,
  TSection,
  TSectionInput,
  TSession,
  TSessionInput,
  TSubject,
  TSubjectInput,
} from "@/types";
import { withMeta } from "@/utils/withMeta";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

// Lists here are small (a school has tens of classes, not thousands), so screens ask for the whole set
const ALL = { limit: 100 };

export const academicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Sessions
    getSessions: build.query<TPaged<TSession>, void>({
      query: () => ({ url: "/sessions", method: "GET", params: ALL }),
      transformResponse: withMeta<TSession>,
      providesTags: [tagTypes.sessions],
    }),
    createSession: build.mutation<TSession, TSessionInput>({
      query: (data) => ({ url: "/sessions", method: "POST", data }),
      invalidatesTags: [tagTypes.sessions, tagTypes.dashboard],
    }),
    updateSession: build.mutation<TSession, { id: string; data: Partial<TSessionInput> }>({
      query: ({ id, data }) => ({ url: `/sessions/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.sessions, tagTypes.dashboard],
    }),

    // Classes
    getClasses: build.query<TPaged<TClass>, void>({
      query: () => ({ url: "/classes", method: "GET", params: ALL }),
      transformResponse: withMeta<TClass>,
      providesTags: [tagTypes.classes],
    }),
    createClass: build.mutation<TClass, TClassInput>({
      query: (data) => ({ url: "/classes", method: "POST", data }),
      invalidatesTags: [tagTypes.classes, tagTypes.sections],
    }),
    updateClass: build.mutation<TClass, { id: string; data: Partial<TClassInput> }>({
      query: ({ id, data }) => ({ url: `/classes/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.classes],
    }),
    deleteClass: build.mutation<unknown, string>({
      query: (id) => ({ url: `/classes/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.classes, tagTypes.sections],
    }),

    // Sections (the hidden default section is never returned)
    getSections: build.query<TPaged<TSection>, { classId?: string } | void>({
      query: (args) => ({ url: "/sections", method: "GET", params: { ...ALL, ...(args ?? {}) } }),
      transformResponse: withMeta<TSection>,
      providesTags: [tagTypes.sections],
    }),
    createSection: build.mutation<TSection, TSectionInput>({
      query: (data) => ({ url: "/sections", method: "POST", data }),
      invalidatesTags: [tagTypes.sections],
    }),
    updateSection: build.mutation<TSection, { id: string; data: Partial<TSectionInput> }>({
      query: ({ id, data }) => ({ url: `/sections/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.sections],
    }),
    deleteSection: build.mutation<unknown, string>({
      query: (id) => ({ url: `/sections/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.sections],
    }),

    // Subjects
    getSubjects: build.query<TPaged<TSubject>, void>({
      query: () => ({ url: "/subjects", method: "GET", params: ALL }),
      transformResponse: withMeta<TSubject>,
      providesTags: [tagTypes.subjects],
    }),
    createSubject: build.mutation<TSubject, TSubjectInput>({
      query: (data) => ({ url: "/subjects", method: "POST", data }),
      invalidatesTags: [tagTypes.subjects],
    }),
    updateSubject: build.mutation<TSubject, { id: string; data: Partial<TSubjectInput> }>({
      query: ({ id, data }) => ({ url: `/subjects/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.subjects],
    }),
    deleteSubject: build.mutation<unknown, string>({
      query: (id) => ({ url: `/subjects/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.subjects],
    }),

    // Class subjects
    getClassSubjects: build.query<TPaged<TClassSubject>, { sessionId?: string; classId?: string }>({
      query: (params) => ({ url: "/class-subjects", method: "GET", params: { ...ALL, ...params } }),
      transformResponse: withMeta<TClassSubject>,
      providesTags: [tagTypes.classSubjects],
    }),
    createClassSubject: build.mutation<TClassSubject, TClassSubjectInput>({
      query: (data) => ({ url: "/class-subjects", method: "POST", data }),
      invalidatesTags: [tagTypes.classSubjects, tagTypes.subjects],
    }),
    updateClassSubject: build.mutation<TClassSubject, { id: string; data: TClassSubjectInput }>({
      query: ({ id, data }) => ({ url: `/class-subjects/${id}`, method: "PATCH", data }),
      invalidatesTags: [tagTypes.classSubjects],
    }),
    deleteClassSubject: build.mutation<unknown, string>({
      query: (id) => ({ url: `/class-subjects/${id}`, method: "DELETE" }),
      invalidatesTags: [tagTypes.classSubjects, tagTypes.subjects],
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetSectionsQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetClassSubjectsQuery,
  useCreateClassSubjectMutation,
  useUpdateClassSubjectMutation,
  useDeleteClassSubjectMutation,
} = academicApi;
