import type { upload as en } from "../en/upload";

export const upload: Record<keyof typeof en, string> = {
  "upload.image.cta": "ছবি আপলোড করতে ক্লিক করুন",
  "upload.image.hint": "JPG, PNG বা WebP। ছবি নিজে থেকেই ছোট হয়ে যায়।",
  "upload.pdf.cta": "PDF আপলোড করতে ক্লিক করুন",
  "upload.pdf.hint": "সর্বোচ্চ ৫ এমবি পর্যন্ত PDF।",
  "upload.compressing": "ছবি তৈরি হচ্ছে",
  "upload.uploading": "আপলোড হচ্ছে {percent}%",
  "upload.done": "আপলোড হয়েছে",
  "upload.remove": "ফাইল সরান",
  "upload.err.TOO_LARGE": "ফাইলটি অনেক বড়।",
  "upload.err.BAD_TYPE": "এই ধরনের ফাইল চলবে না।",
  "upload.err.NOT_CONFIGURED": "ফাইল আপলোড এখনো চালু করা হয়নি।",
  "upload.err.FAILED": "আপলোড হয়নি। আবার চেষ্টা করুন।",
};
