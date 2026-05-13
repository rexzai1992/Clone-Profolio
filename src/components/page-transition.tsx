"use client";

import { AnimatePresence, motion } from "framer-motion";

interface PageTransitionProps {
  isActive: boolean;
  brandName: string;
}

export function PageTransition({ isActive, brandName }: PageTransitionProps) {
  return (
    <AnimatePresence>
      {isActive ? (
        <motion.div
          key="page-transition"
          className="page-transition"
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          animate={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden="true"
        >
          <motion.span
            className="page-transition__brand"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {brandName}
          </motion.span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

