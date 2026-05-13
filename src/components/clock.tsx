"use client";

import { useEffect, useState } from "react";

interface ClockParts {
  zone: string;
  hour: string;
  minutes: string;
  weekday: string;
  month: string;
  day: string;
  year: string;
}

function getClockParts(): ClockParts {
  const now = new Date();
  const dateParts = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
  }).formatToParts(now);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value ?? "";

  return {
    zone: getPart("timeZoneName"),
    hour: getPart("hour"),
    minutes: getPart("minute"),
    weekday: getPart("weekday"),
    month: getPart("month"),
    day: getPart("day"),
    year: getPart("year")
  };
}

export function Clock() {
  const [clockParts, setClockParts] = useState<ClockParts>(() => getClockParts());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockParts(getClockParts());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <aside className="site-clock" aria-label="Current time">
      <p className="site-clock__time">
        <span className="site-clock__zone">{clockParts.zone}</span>
        <span>{clockParts.hour}</span>
        <span className="site-clock__separator" aria-hidden="true" />
        <span>{clockParts.minutes}</span>
      </p>
      <p className="site-clock__today">
        <span>{clockParts.weekday}</span>
        <span>{clockParts.month}</span>
        <span>{clockParts.day}</span>
        <span>{clockParts.year}</span>
      </p>
    </aside>
  );
}
