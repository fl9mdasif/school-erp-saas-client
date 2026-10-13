"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Phone mockup that tilts back, flattens and climbs over the headline as the section scrolls.
 * Adapted from "Phone Scroll Hero" on 21st.dev (ruixen.ui): our tokens, framer-motion's scroll hook,
 * and a flat static phone when the visitor prefers reduced motion.
 */
export function PhoneScroll({
  titleComponent,
  children,
  overlap = 14,
  tilt = 22,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
  overlap?: number;
  tilt?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const rotateX = useTransform(scrollYProgress, [0.05, 0.5], reduce ? [0, 0] : [tilt, 0]);
  const scale = useTransform(scrollYProgress, [0.05, 0.5], reduce ? [1, 1] : [0.94, 1]);
  const titleY = useTransform(scrollYProgress, [0.05, 0.5], reduce ? [0, 0] : [0, -24]);
  const phoneY = useTransform(scrollYProgress, [0.05, 0.5], reduce ? ["0%", "0%"] : ["0%", `-${overlap}%`]);

  return (
    <section ref={ref} className="relative flex h-[42rem] items-start justify-center overflow-hidden px-4 pt-10 md:h-[56rem] md:pt-20">
      <div className="w-full" style={{ perspective: "1200px" }}>
        <motion.div style={{ y: titleY }} className="relative z-0 mx-auto max-w-3xl text-center">
          {titleComponent}
        </motion.div>
        <motion.div style={{ y: phoneY, rotateX, scale }} className="relative z-10 mt-6 md:mt-10">
          <div className="relative mx-auto w-[13rem] sm:w-[15rem] md:w-[17rem]">
            <div className="aspect-[9/19.5] rounded-[2.5rem] border border-navy/30 bg-navy p-[0.35rem] shadow-[0_10px_20px_rgba(11,42,74,0.22),0_40px_60px_-20px_rgba(11,42,74,0.4)]">
              <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-background">
                <div aria-hidden="true" className="absolute left-1/2 top-2 z-10 h-[1.1rem] w-[4.25rem] -translate-x-1/2 rounded-full bg-black" />
                {children}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
