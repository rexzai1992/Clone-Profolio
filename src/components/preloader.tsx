"use client";

import { AnimatePresence, motion } from "framer-motion";

interface PreloaderProps {
  isActive: boolean;
  brandName: string;
  textureSrc: string;
  reducedMotion?: boolean;
}

export function Preloader({ isActive, brandName, textureSrc, reducedMotion = false }: PreloaderProps) {
  return (
    <AnimatePresence>
      {isActive ? (
        <motion.div
          key="preloader"
          className="preloader"
          initial={{ opacity: 1 }}
          animate={reducedMotion ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
        >
          <motion.p
            className="preloader__tiny-brand"
            initial={{ opacity: 0, y: 8 }}
            animate={reducedMotion ? { opacity: 0 } : { opacity: 1, y: 0 }}
            transition={{
              delay: reducedMotion ? 0 : 0.5,
              duration: reducedMotion ? 0.01 : 0.6,
              ease: [0.76, 0, 0.24, 1]
            }}
          >
            {brandName}
          </motion.p>

          <motion.div
            className="preloader__logo"
            initial={{ opacity: 0, scale: 0.88, clipPath: "inset(52% 0 52% 0 round 999px)" }}
            animate={reducedMotion ? { opacity: 0 } : { opacity: 1, scale: 1, clipPath: "inset(0 0 0 0 round 0px)" }}
            transition={{
              delay: reducedMotion ? 0 : 1.1,
              duration: reducedMotion ? 0.01 : 0.8,
              ease: [0.76, 0, 0.24, 1]
            }}
          >
            <span className="preloader__logo-base">{brandName}</span>
            <motion.span
              className="preloader__logo-mask"
              style={{ backgroundImage: `url(${textureSrc})` }}
              initial={{ opacity: 0, backgroundPosition: "12% 50%" }}
              animate={reducedMotion ? { opacity: 0 } : { opacity: 1, backgroundPosition: "88% 50%" }}
              transition={{
                delay: reducedMotion ? 0 : 1.9,
                duration: reducedMotion ? 0.01 : 0.8,
                ease: "linear"
              }}
            >
              {brandName}
            </motion.span>
          </motion.div>

          <motion.div
            className="preloader__circle-reveal"
            initial={reducedMotion ? { opacity: 0 } : { clipPath: "circle(6% at 50% 50%)", opacity: 1 }}
            animate={
              reducedMotion
                ? { opacity: 0 }
                : { clipPath: "circle(140% at 50% 50%)", opacity: 0.98 }
            }
            transition={{
              delay: reducedMotion ? 0 : 2.7,
              duration: reducedMotion ? 0.01 : 1,
              ease: [0.76, 0, 0.24, 1]
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

