"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/data/site-config";

export function ErrorPage() {
  return (
    <main className="error-page">
      <motion.p
        className="error-page__code"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        404
      </motion.p>

      <motion.p
        className="error-page__brand"
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {SITE_CONFIG.brandName}
      </motion.p>

      <Link className="error-page__link" href="/">
        Back to home
      </Link>
    </main>
  );
}

