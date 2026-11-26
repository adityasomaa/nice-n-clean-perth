"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Fades + lifts its children in once they enter the viewport. */
export function Reveal({ delay = 0, y = 32, ...rest }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    />
  );
}
