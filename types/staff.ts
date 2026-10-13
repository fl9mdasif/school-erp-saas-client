export type TStaffRole = "admin" | "teacher" | "accountant";

export type TStaff = {
  _id: string;
  role: TStaffRole;
  name: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  mustChangePassword: boolean;
  lastLoginAt?: string;
  createdAt: string;
};

export type TStaffInput = {
  role: TStaffRole;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
};

export type TStaffCreated = {
  user: { id: string; role: TStaffRole; name: string; email?: string; phone?: string };
  temporaryPassword: string;
};
