"use client";

/**
 * Admin login screen. Uses a plain fetch (not the api() wrapper) on purpose:
 * a 401 here means "wrong password", not "session expired".
 *
 * Dev hint (never rendered): test password is `demo-admin-2026`,
 * configurable via the ADMIN_PASSWORD env var.
 */

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAdminSession } from "@/components/admin/api";

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const pw = password.trim();
    if (!pw) {
      setError("Please enter the admin password.");
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const body =
        (await res.json().catch(() => null)) as
          | { success?: boolean; error?: string; token?: string }
          | null;
      if (res.ok && body?.success) {
        // Keep the token for the x-admin-token header (cookies are blocked
        // inside cross-site iframes, e.g. the chat preview panel).
        if (body.token) saveAdminSession(body.token);
        toast.success("Welcome back!");
        onLoggedIn();
        return;
      }
      const msg =
        body?.error ||
        (res.status === 429
          ? "Too many attempts — please wait a moment."
          : "Wrong password. Please try again.");
      setError(msg);
      toast.error(msg);
      inputRef.current?.focus();
      inputRef.current?.select();
    } catch {
      const msg = "Could not reach the server. Check your connection.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-10">
      {/* soft brand blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-pink-soft/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-lime-soft/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-orange-soft/60 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        <div className="rounded-3xl border-2 border-ink bg-surface p-6 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8">
          <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-ink bg-cream shadow-[3px_3px_0_0_var(--color-ink)]">
            <Image
              src="/images/logo-176.webp"
              alt="Demo logo"
              width={80}
              height={80}
              priority
              className="h-full w-full object-contain p-1.5"
            />
          </span>
          <h1 className="mt-5 text-center font-display text-2xl font-bold tracking-tight">
            DEMO <span className="text-pink">Admin</span>
          </h1>
          <p className="mt-1 text-center text-sm text-muted-warm">
            Sign in to manage the shop.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin password</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-warm"
                  aria-hidden
                />
                <Input
                  ref={inputRef}
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter password"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "admin-password-error" : undefined}
                  className="h-11 rounded-xl border-2 border-ink/15 bg-cream pl-9 pr-3 text-base"
                />
              </div>
              {error && (
                <p
                  id="admin-password-error"
                  role="alert"
                  className="text-sm font-medium text-[#e5484d]"
                >
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl border-2 border-ink bg-orange text-base font-bold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" aria-hidden />
                  Sign in
                </>
              )}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-muted-warm">
          Demo Waffles · Admin panel
        </p>
      </motion.div>
    </div>
  );
}
