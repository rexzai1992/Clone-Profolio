"use client";

import { useMemo, useState, type FormEvent } from "react";
import styles from "@/components/admin/admin-panel.module.css";

function getNextPath() {
  if (typeof window === "undefined") {
    return "/admin/";
  }

  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") ? next : "/admin/";
}

export function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPath = useMemo(getNextPath, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Login failed.");
      }

      window.location.assign(nextPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.authPage}>
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <p className={styles.eyebrow}>Portfolio Admin</p>
        <h1>Sign in</h1>
        <label className={styles.field}>
          <span>Username</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
        </label>
        <label className={styles.field}>
          <span>Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {message ? <p className={styles.error}>{message}</p> : null}
        <button className={styles.primaryButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
