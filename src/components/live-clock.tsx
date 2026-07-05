"use client";

import { useEffect, useMemo, useState } from "react";

interface LiveClockProps {
  show: boolean;
}

export function LiveClock({ show }: LiveClockProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    setIsMounted(true);
    const timer = window.setInterval(() => {
      setTime(new Date());
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
    <div className={`live-clock ${show ? "is-shown" : ""}`} aria-label="Current date and time">
      <span>{isMounted ? parts.clock : "--:--:--"}</span>
      <small>{isMounted ? parts.date : "---"}</small>
    </div>
  );
}
