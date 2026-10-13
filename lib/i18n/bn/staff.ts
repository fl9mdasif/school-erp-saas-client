import type { staff as en } from "../en/staff";

export const staff: Record<keyof typeof en, string> = {
  "st.title": "কর্মী",
  "st.desc": "অ্যাডমিন, শিক্ষক ও হিসাবরক্ষক, যারা সাইন ইন করতে পারেন।",
  "st.add": "কর্মী যোগ করুন",
  "st.search": "নাম, ইমেইল বা ফোন দিয়ে খুঁজুন",
  "st.allRoles": "সব ভূমিকা",
  "st.allStatus": "সব অবস্থা",
  "st.col.name": "নাম",
  "st.col.role": "ভূমিকা",
  "st.col.status": "অবস্থা",
  "st.col.lastLogin": "শেষ সাইন ইন",
  "st.role.admin": "অ্যাডমিন",
  "st.role.teacher": "{teacher}",
  "st.role.accountant": "হিসাবরক্ষক",
  "st.status.active": "সক্রিয়",
  "st.status.inactive": "নিষ্ক্রিয়",
  "st.never": "কখনো না",
  "st.you": "আপনি",
  "st.empty": "কোনো কর্মী মেলেনি",
  "st.emptyDesc": "শিক্ষক বা হিসাবরক্ষক যোগ করুন, যাতে তারা সাইন ইন করতে পারেন।",
};
