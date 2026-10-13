import type { notices as en } from "../en/notices";

export const notices: Record<keyof typeof en, string> = {
  "not.title": "নোটিশ",
  "not.desc": "কর্মী, শিক্ষার্থী ও অভিভাবকদের জন্য ঘোষণা, চাইলে পাবলিক ওয়েবসাইটেও।",
  "not.add": "নোটিশ লিখুন",
  "not.allStatus": "সব অবস্থা",
  "not.col.title": "নোটিশ",
  "not.col.status": "অবস্থা",
  "not.col.date": "প্রকাশের তারিখ",
  "not.status.published": "প্রকাশিত",
  "not.status.draft": "খসড়া",
  "not.public": "পাবলিক সাইটে",
  "not.aud.all": "সবাই",
  "not.aud.staff": "কর্মী",
  "not.aud.students_guardians": "শিক্ষার্থী ও অভিভাবক",
  "not.aud.class": "শ্রেণি",
  "not.aud.section": "শাখা",
  "not.empty": "এখনো কোনো নোটিশ নেই",
  "not.emptyDesc": "প্রতিষ্ঠানের প্রথম নোটিশ লিখুন।",
  "not.deleted": "নোটিশ মুছে ফেলা হয়েছে",
  "not.deleteTitle": "{name} মুছবেন?",
  "not.deleteBody": "এটি পাবলিক ওয়েবসাইটসহ সবার কাছ থেকে চলে যাবে।",
};
