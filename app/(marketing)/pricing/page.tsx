import type { Metadata } from "next";
import { PricingSection } from "@/components/marketing/PricingSection";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing by number of students. Every plan starts with a 30-day free trial.",
};

export default function PricingPage() {
  return <PricingSection />;
}
