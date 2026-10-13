import type { fees as en } from "../en/fees";

export const fees: Record<keyof typeof en, string> = {
  "fee.head.title": "ফি খাত",
  "fee.head.desc": "যে ধরনের ফি নেন, যেমন বেতন বা পরীক্ষার ফি। খাত বন্ধ করা যায়, মোছা যায় না, তাই পুরোনো চালান পড়া যায়।",
  "fee.head.add": "ফি খাত যোগ করুন",
  "fee.head.edit": "ফি খাত সম্পাদনা",
  "fee.head.name": "নাম",
  "fee.head.code": "কোড",
  "fee.head.codeHint": "বড় হাতের অক্ষর, সংখ্যা ও আন্ডারস্কোর, যেমন TUITION। পরে বদলানো যায় না।",
  "fee.head.kind": "ধরন",
  "fee.head.kind.recurring": "নিয়মিত",
  "fee.head.kind.one_time": "একবার",
  "fee.head.saved": "ফি খাত সংরক্ষিত",
  "fee.head.empty": "এখনো কোনো ফি খাত নেই",
  "fee.head.emptyDesc": "বেতনসহ যে ফি নেন সেগুলো যোগ করুন।",
  "val.feeCode": "২ থেকে ২০টি বড় হাতের অক্ষর, সংখ্যা বা আন্ডারস্কোর দিন",
};
