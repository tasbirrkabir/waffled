"use client";

/**
 * Content tab: hero image management + signature picks selection.
 * Full signature customisation (badge label + card copy) lives in the
 * Products tab edit form — here we only toggle membership.
 */

import * as React from "react";
import Image from "next/image";
import {
  ImageIcon,
  Loader2,
  RotateCcw,
  Save,
  Star,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTk } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { api, isUnauthorizedError, uploadImage } from "./api";
import { useAdminData } from "./use-admin-data";
import { ErrorState, TabToolbar } from "./ui-bits";
import type { AdminProduct, AdminSettings } from "./types";

const DEFAULT_HERO = "/images/hero-waffle-gmaps.webp";

export function ContentTab() {
  const loader = React.useCallback(async () => {
    const [productsRes, settingsRes] = await Promise.all([
      api<{ products: AdminProduct[] }>("/api/admin/products"),
      api<{ settings: AdminSettings }>("/api/admin/settings"),
    ]);
    return { products: productsRes.products, settings: settingsRes.settings };
  }, []);
  const { data, loading, error, reload, setData } = useAdminData(loader);

  // ---- hero form state (initialised once from the server) ----
  const [heroImage, setHeroImage] = React.useState("");
  const [heroAlt, setHeroAlt] = React.useState("");
  const [heroReady, setHeroReady] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [savingHero, setSavingHero] = React.useState(false);
  const initRef = React.useRef(false);

  React.useEffect(() => {
    if (data && !initRef.current) {
      initRef.current = true;
      setHeroImage(data.settings.heroImage);
      setHeroAlt(data.settings.heroImageAlt);
      setHeroReady(true);
    }
  }, [data]);

  async function handleHeroFile(file: File | undefined) {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "site");
      setHeroImage(url);
      toast.success("Photo uploaded — hit Save to publish it");
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function saveHero() {
    if (savingHero || uploading) return;
    setSavingHero(true);
    try {
      const res = await api<{ settings: AdminSettings }>("/api/admin/settings", {
        method: "PATCH",
        json: { heroImage, heroImageAlt: heroAlt.trim() },
      });
      toast.success("Home page hero updated");
      // reflect server truth locally (no full reload needed)
      setHeroImage(res.settings.heroImage);
      setHeroAlt(res.settings.heroImageAlt);
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Could not save the hero.");
      }
    } finally {
      setSavingHero(false);
    }
  }

  // ---- signature picks ----
  const products = data?.products ?? [];
  const active = React.useMemo(() => products.filter((p) => p.isActive), [products]);
  const signatureCount = active.filter((p) => p.isSignature).length;

  async function toggleSignature(p: AdminProduct, next: boolean) {
    // optimistic
    setData((prev) =>
      prev
        ? {
            ...prev,
            products: prev.products.map((x) =>
              x.id === p.id ? { ...x, isSignature: next } : x
            ),
          }
        : prev
    );
    try {
      await api("/api/admin/products", {
        method: "PATCH",
        json: { id: p.id, isSignature: next },
      });
      toast.success(
        next ? `“${p.name}” joined the signature picks` : `“${p.name}” left the signature picks`
      );
    } catch (err) {
      // revert
      setData((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.map((x) =>
                x.id === p.id ? { ...x, isSignature: !next } : x
              ),
            }
          : prev
      );
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Could not update.");
      }
    }
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <TabToolbar title="Content" onRefresh={reload} refreshing={loading} />
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!data || !heroReady) {
    return (
      <div className="space-y-4">
        <TabToolbar title="Content" onRefresh={reload} refreshing={loading} />
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  // group active products by category label, preserving order
  const groups: { label: string; items: AdminProduct[] }[] = [];
  for (const p of active) {
    const g = groups.find((x) => x.label === p.categoryLabel);
    if (g) g.items.push(p);
    else groups.push({ label: p.categoryLabel, items: [p] });
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <TabToolbar
        title="Content"
        sub="What the home page shows — no code needed."
        onRefresh={reload}
        refreshing={loading}
      />

      {/* ---------- Hero image ---------- */}
      <section className="rounded-2xl border-2 border-ink/10 bg-surface p-4 sm:p-5">
        <h3 className="font-display text-lg font-bold">Hero image</h3>
        <p className="mt-0.5 text-sm text-muted-warm">
          The big photo at the very top of the home page.
        </p>

        <div className="mt-4 grid items-start gap-5 sm:grid-cols-2">
          {/* preview */}
          <figure className="relative">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border-2 border-ink/15 bg-cream">
              <Image
                src={heroImage || DEFAULT_HERO}
                alt={heroAlt || "Waffled Sreemangal hero photo"}
                fill
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover"
              />
              <span
                className={cn(
                  "absolute left-2.5 top-2.5 rounded-full border-2 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider",
                  heroImage
                    ? "border-ink/20 bg-surface/90 text-ink"
                    : "border-ink/20 bg-cream/90 text-muted-warm"
                )}
              >
                {heroImage ? "Custom" : "Default"}
              </span>
              {uploading && (
                <span className="absolute inset-0 flex items-center justify-center bg-cream/70">
                  <Loader2 className="h-6 w-6 animate-spin text-pink" aria-hidden />
                </span>
              )}
            </div>
            <figcaption className="mt-2 text-xs text-muted-warm">
              {heroImage
                ? "A cropped preview — the site letterboxes it the same way."
                : "No custom photo saved — the site is using the default one."}
            </figcaption>
          </figure>

          {/* controls */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {uploading ? (
                <Button disabled className="rounded-xl border-2 border-ink bg-orange font-bold text-white">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Uploading…
                </Button>
              ) : (
                <Button
                  asChild
                  className="rounded-xl border-2 border-ink bg-orange font-bold text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                >
                  <label htmlFor="hero-image" className="cursor-pointer">
                    <Upload className="h-4 w-4" aria-hidden />
                    Upload photo
                  </label>
                </Button>
              )}
              <input
                id="hero-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  handleHeroFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              {heroImage && (
                <Button
                  variant="outline"
                  onClick={() => setHeroImage("")}
                  disabled={uploading || savingHero}
                  className="rounded-xl border-2 border-ink/15 bg-white font-semibold"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Use default
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-alt">Alt text</Label>
              <Input
                id="hero-alt"
                value={heroAlt}
                onChange={(e) => setHeroAlt(e.target.value)}
                placeholder="Describe the photo for screen readers"
                maxLength={300}
                className="h-11 rounded-xl border-2 border-ink/15 bg-cream"
              />
              <p className="text-xs text-muted-warm">
                Saving without a custom photo switches the site back to the default.
              </p>
            </div>

            <Button
              onClick={saveHero}
              disabled={savingHero || uploading}
              className="h-11 w-full rounded-xl border-2 border-ink bg-pink px-4 font-bold text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:w-auto"
            >
              {savingHero ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              Save hero
            </Button>
          </div>
        </div>
      </section>

      {/* ---------- Signature picks ---------- */}
      <section className="rounded-2xl border-2 border-ink/10 bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold">Signature picks</h3>
            <p className="mt-0.5 text-sm text-muted-warm">
              Tick a product to feature it in the home page section.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-orange/30 bg-orange-soft px-3 py-1 text-xs font-bold text-orange tabular-nums">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
            {signatureCount} picked
          </span>
        </div>

        <p className="mt-3 rounded-xl border-2 border-dashed border-ink/15 bg-cream px-3.5 py-2.5 text-xs leading-relaxed text-muted-warm">
          The badge label and card copy for each pick are customised in the{" "}
          <strong className="text-ink">Products</strong> tab — edit a product and turn on
          “Signature pick”.
        </p>

        {active.length === 0 ? (
          <p className="mt-4 text-sm text-muted-warm">
            No active products — add some in the Products tab first.
          </p>
        ) : (
          <div className="nice-scrollbar mt-4 max-h-96 space-y-5 overflow-y-auto pr-1">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-warm">
                  {g.label}
                  <span className="ml-1.5 font-semibold normal-case tracking-normal opacity-70">
                    ({g.items.length})
                  </span>
                </p>
                <ul className="mt-2 space-y-2">
                  {g.items.map((p) => (
                    <li
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 bg-cream/60 p-2.5 transition-colors",
                        p.isSignature ? "border-pink/40 bg-pink-soft/30" : "border-ink/10"
                      )}
                    >
                      <Checkbox
                        id={`sig-${p.id}`}
                        checked={p.isSignature}
                        onCheckedChange={(v) => toggleSignature(p, v === true)}
                        aria-label={`Feature ${p.name} on the home page`}
                      />
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.imageAlt || p.name}
                          width={44}
                          height={44}
                          className="shrink-0 rounded-lg border-2 border-ink/10 bg-white object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-ink/20 bg-white text-muted-warm"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold leading-tight">{p.name}</p>
                        <p className="truncate text-xs text-muted-warm">
                          {formatTk(p.price)}
                          {p.signatureTag ? ` · badge “${p.signatureTag}”` : ""}
                        </p>
                      </div>
                      {p.isSignature && (
                        <Star
                          className="h-5 w-5 shrink-0 text-orange"
                          fill="currentColor"
                          aria-label="Signature pick"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
