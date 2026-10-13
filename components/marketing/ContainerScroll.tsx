"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * 3D scroll hero. Adapted from the "Container Scroll Animation" on 21st.dev (Aceternity UI):
 * the card starts tilted back, then flattens and scales as the section scrolls through.
 * Changes: our navy and teal tokens instead of hard-coded greys, shorter scroll distance on phones,
 * and a motionless version when the visitor prefers reduced motion.
 */
export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // progress runs 0 to 1 while the section crosses the screen; the card is flat by the middle
  const rotate = useTransform(scrollYProgress, [0, 0.45], reduce ? [0, 0] : [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], reduce ? [1, 1] : isMobile ? [0.82, 0.96] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.45], reduce ? [0, 0] : [0, -60]);

  return (
    <div ref={ref} className="relative flex h-[44rem] items-start justify-center px-2 pt-6 md:h-[62rem] md:px-8 md:pt-16">
      <div className="w-full" style={{ perspective: "1000px" }}>
        <motion.div style={{ translateY: translate }} className="mx-auto max-w-4xl text-center">
          {titleComponent}
        </motion.div>
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow: "0 9px 20px rgba(11,42,74,.18), 0 37px 37px rgba(11,42,74,.12), 0 84px 50px rgba(11,42,74,.06)",
          }}
          className="mx-auto -mt-4 h-[26rem] w-full max-w-5xl rounded-[28px] border-4 border-navy bg-navy p-2 md:-mt-10 md:h-[36rem] md:p-5"
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-background md:p-4">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
