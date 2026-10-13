export type TAttendanceToday = { present: number; absent: number; late: number; leave: number; sheets: number };

export type TAdminSummary = {
  role: "admin";
  date: string;
  students: number;
  staff: number;
  newInquiries: number;
  notices: number;
  attendanceToday: TAttendanceToday;
};

/** The summary differs by role, so each portal narrows it with its own type. */
export type TDashboardSummary = TAdminSummary;
