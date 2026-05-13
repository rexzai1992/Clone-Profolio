"use client";

import Image, { type ImageProps } from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";

interface ImageRevealProps extends Omit<ImageProps, "onLoad"> {
  wrapperClassName?: string;
  imageClassName?: string;
  delay?: number;
  revealOnView?: boolean;
  once?: boolean;
}

export function ImageReveal({
  wrapperClassName,
  imageClassName,
  delay = 0,
  revealOnView = true,
  once = true,
  style,
  ...props
}: ImageRevealProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const reducedMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(frameRef, { amount: 0.24, margin: "0px 0px -12% 0px", once });
  const shouldReveal = reducedMotion || !revealOnView || inView;

  return (
    <motion.div
      ref={frameRef}
      className={`image-reveal ${wrapperClassName ?? ""}`.trim()}
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={shouldReveal ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="image-reveal__placeholder"
        aria-hidden="true"
        animate={isLoaded ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="image-reveal__media"
        initial={reducedMotion ? false : { opacity: 0, scale: 1.04, filter: "blur(12px)", clipPath: "inset(8% 0 8% 0)" }}
        animate={
          isLoaded
            ? { opacity: 1, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0 0)" }
            : reducedMotion
              ? { opacity: 1, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0 0)" }
              : undefined
        }
        transition={{ duration: reducedMotion ? 0.01 : 1, ease: [0.76, 0, 0.24, 1], delay }}
      >
        <Image
          {...props}
          className={`image-reveal__img ${imageClassName ?? ""}`.trim()}
          style={style}
          onLoad={() => setIsLoaded(true)}
        />
      </motion.div>
    </motion.div>
  );
}

