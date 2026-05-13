"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface LiveClockProps {
  show: boolean;
}

function getNow() {
  return new Date();
}

export function LiveClock({ show }: LiveClockProps) {
  const [time, setTime] = useState<Date>(() => getNow());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(getNow());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const parts = useMemo(() => {
    const clock = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(time);

    const date = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric"
    }).format(time);

    return { clock, date };
  }, [time]);

  return (
    <motion.div
      className="live-clock"
      initial={{ opacity: 0, y: -8 }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Current date and time"
    >
      <span>{parts.clock}</span>
      <small>{parts.date}</small>
    </motion.div>
  );
}

