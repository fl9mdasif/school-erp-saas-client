import type { Metadata } from "next";
import { AllFeatures } from "@/components/marketing/AllFeatures";

export const metadata: Metadata = {
  title: "All features",
  description: "Everything Digital Pathshala does for schools, madrasas and coaching centres: attendance, fees, exams, results, a public website and a parent portal.",
};

export default function FeaturesPage() {
  return <AllFeatures />;
}
