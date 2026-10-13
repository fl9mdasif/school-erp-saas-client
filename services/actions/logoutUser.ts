"use server";

import { cookies } from "next/headers";

export const logoutUser = async () => {
  (await cookies()).delete("session");
};
