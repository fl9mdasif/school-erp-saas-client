import type { students as en } from "../en/students";

export const students: Record<keyof typeof en, string> = {
  "stu.desc": "প্রতিষ্ঠানের সব {student}। প্রোফাইল, ফি ও ফলাফল দেখতে একটি খুলুন।",
  "stu.add": "{student} যোগ করুন",
  "stu.import": "CSV ইমপোর্ট",
  "stu.search": "নাম, আইডি বা ভর্তি নম্বর দিয়ে খুঁজুন",
  "stu.allClasses": "সব {class}",
  "stu.allSections": "সব {section}",
  "stu.allStatus": "সব অবস্থা",
  "stu.col.name": "{student}",
  "stu.col.status": "অবস্থা",
  "stu.status.active": "সক্রিয়",
  "stu.status.transferred": "বদলি",
  "stu.status.passed_out": "উত্তীর্ণ হয়ে গেছে",
  "stu.status.dropped": "ঝরে পড়া",
  "stu.status.inactive": "নিষ্ক্রিয়",
  "stu.empty": "কোনো {student} মেলেনি",
  "stu.emptyDesc": "একজন যোগ করুন, CSV ইমপোর্ট করুন, বা ফিল্টার বদলান।",
};
