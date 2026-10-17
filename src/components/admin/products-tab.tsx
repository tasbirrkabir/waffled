"use client";

/**
 * Products tab: list (table on desktop, cards on mobile), quick active /
 * signature toggles, add/edit dialog and category management.
 */

import * as React from "react";
import Image from "next/image";
import {
  Cookie,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Star,
  Tags,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTk } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { api, isUnauthorizedError } from "./api";
import { useAdminData } from "./use-admin-data";
import { CategoryManagerDialog } from "./category-manager";
import { ProductDialog } from "./product-dialog";
import { EmptyState, ErrorState, TabToolbar } from "./ui-bits";
import type { AdminCategory, AdminProduct } from "./types";

const TAG_BADGES: Record<string, string> = {
  popular: "bg-pink text-white",
  new: "bg-orange text-white",
  "must-try": "bg-cyan text-ink",
};

const TAG_LABELS: Record<string, string> = {
  popular: "Popular",
  new: "New",
  "must-try": "Must try",
};

function ProductThumb({ p, size }: { p: AdminProduct; size: number }) {
  if (!p.image) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-ink/20 bg-cream text-muted-warm"
      >
        <Cookie className="h-4 w-4" />
      </span>
    );
  }
  return (
    <Image
      src={p.image}
      alt={p.imageAlt || p.name}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-lg border-2 border-ink/10 bg-cream object-cover"
    />
  );
}

function TagBadges({ p }: { p: AdminProduct }) {
  if (p.tags.length === 0) return <span className="text-xs text-muted-warm/60">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {p.tags.map((t) => (
        <span
          key={t}
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider",
            TAG_BADGES[t] ?? "bg-muted text-muted-warm"
          )}
        >
          {TAG_LABELS[t] ?? t}
        </span>
      ))}
    </span>
  );
}

function StatusBadges({ p }: { p: AdminProduct }) {
  return (
    <span className="flex flex-wrap items-center gap-1">
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider",
          p.isActive
            ? "border-lime/50 bg-lime-soft text-ink"
            : "border-border-warm bg-muted text-muted-warm"
        )}
      >
        {p.isActive ? "Active" : "Hidden"}
      </span>
      {p.isSignature && (
        <span className="inline-flex items-center gap-1 rounded-full border border-orange/40 bg-orange-soft px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wider text-orange">
          <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
          Signature
        </span>
      )}
    </span>
  );
}

export function ProductsTab() {
  const loader = React.useCallback(async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      api<{ products: AdminProduct[] }>("/api/admin/products"),
      api<{ categories: AdminCategory[] }>("/api/admin/categories"),
    ]);
    return { products: productsRes.products, categories: categoriesRes.categories };
  }, []);
  const { data, loading, error, reload, setData } = useAdminData(loader);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AdminProduct | null>(null);
  const [catOpen, setCatOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(p: AdminProduct) {
    setEditing(p);
    setDialogOpen(true);
  }

  /** Quick toggle straight from the list row (optimistic, reverts on error). */
  async function quickToggle(
    p: AdminProduct,
    patch: { isActive?: boolean; isSignature?: boolean }
  ) {
    if (togglingId || deleteTarget) return;
    setTogglingId(p.id);
    // optimistic local update
    setData((prev) =>
      prev
        ? {
            ...prev,
            products: prev.products.map((x) => (x.id === p.id ? { ...x, ...patch } : x)),
          }
        : prev
    );
    try {
      await api("/api/admin/products", { method: "PATCH", json: { id: p.id, ...patch } });
      if (patch.isActive !== undefined) {
        toast.success(
          patch.isActive ? `${p.name} is visible again` : `${p.name} is hidden from the site`
        );
      } else {
        toast.success(
          patch.isSignature
            ? `${p.name} added to signature picks`
            : `${p.name} removed from signature picks`
        );
      }
    } catch (err) {
      // revert
      setData((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.map((x) =>
                x.id === p.id
                  ? {
                      ...x,
                      ...(patch.isActive !== undefined ? { isActive: !patch.isActive } : {}),
                      ...(patch.isSignature !== undefined ? { isSignature: !patch.isSignature } : {}),
                    }
                  : x
              ),
            }
          : prev
      );
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Could not update.");
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    const target = deleteTarget;
    if (!target || deleting) return;
    setDeleting(true);
    try {
      await api(`/api/admin/products?id=${encodeURIComponent(target.id)}`, {
        method: "DELETE",
      });
      toast.success(`“${target.name}” deleted`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Could not delete the product.");
      }
    } finally {
      setDeleting(false);
    }
  }

  function rowActions(p: AdminProduct) {
    const busy = togglingId === p.id;
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => quickToggle(p, { isActive: !p.isActive })}
          disabled={busy}
          aria-label={p.isActive ? `Hide ${p.name}` : `Show ${p.name}`}
          title={p.isActive ? "Hide from site" : "Show on site"}
          className="h-9 w-9 rounded-lg text-ink hover:bg-cream"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : p.isActive ? (
            <Eye className="h-4 w-4" aria-hidden />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-warm" aria-hidden />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => quickToggle(p, { isSignature: !p.isSignature })}
          disabled={busy}
          aria-label={p.isSignature ? `Remove ${p.name} from signature picks` : `Add ${p.name} to signature picks`}
          title={p.isSignature ? "Remove from signature picks" : "Add to signature picks"}
          className={cn(
            "h-9 w-9 rounded-lg hover:bg-cream",
            p.isSignature ? "text-orange" : "text-muted-warm"
          )}
        >
          <Star className={cn("h-4 w-4", p.isSignature && "fill-current")} aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openEdit(p)}
          aria-label={`Edit ${p.name}`}
          className="h-9 w-9 rounded-lg text-ink hover:bg-cream"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteTarget(p)}
          aria-label={`Delete ${p.name}`}
          className="h-9 w-9 rounded-lg text-[#e5484d] hover:bg-[#e5484d]/10"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <TabToolbar title="Products" onRefresh={reload} refreshing={loading} />
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <TabToolbar
        title="Products"
        count={loading && !data ? undefined : products.length}
        sub="Hidden items stay out of the public menu but keep their orders."
        onRefresh={reload}
        refreshing={loading}
      >
        <Button
          variant="outline"
          onClick={() => setCatOpen(true)}
          className="h-9 rounded-xl border-2 border-ink/15 bg-surface px-3 text-xs font-bold text-ink hover:border-ink sm:text-sm"
        >
          <Tags className="h-4 w-4" aria-hidden />
          Categories
        </Button>
        <Button
          onClick={openCreate}
          className="h-9 rounded-xl border-2 border-ink bg-orange px-3 text-xs font-bold text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add product
        </Button>
      </TabToolbar>

      {loading && !data ? (
        <div className="space-y-3" aria-label="Loading products">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl sm:h-16" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          hint="Add your first waffle, shake or add-on and it appears on the site."
          action={
            <Button
              onClick={openCreate}
              className="rounded-xl border-2 border-ink bg-orange font-bold text-white shadow-[3px_3px_0_0_var(--color-ink)]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add product
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border-2 border-ink/10 bg-surface md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-56">Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} className={cn(!p.isActive && "opacity-60")}>
                    <TableCell className="py-2.5">
                      <span className="flex items-center gap-3">
                        <ProductThumb p={p} size={48} />
                        <span className="min-w-0">
                          <span className="block max-w-56 truncate font-display text-sm font-bold leading-tight">
                            {p.name}
                          </span>
                          <span className="block max-w-56 truncate text-xs text-muted-warm">
                            {p.description || "No description"}
                          </span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{p.categoryLabel}</TableCell>
                    <TableCell className="text-right font-display font-bold text-orange tabular-nums">
                      {formatTk(p.price)}
                    </TableCell>
                    <TableCell>
                      <TagBadges p={p} />
                    </TableCell>
                    <TableCell>
                      <StatusBadges p={p} />
                    </TableCell>
                    <TableCell>
                      <span className="flex justify-end gap-0.5">{rowActions(p)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {products.map((p) => (
              <li
                key={p.id}
                className={cn(
                  "rounded-2xl border-2 border-ink/10 bg-surface p-3.5",
                  !p.isActive && "opacity-70"
                )}
              >
                <div className="flex gap-3">
                  <ProductThumb p={p} size={64} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="min-w-0 font-display text-base font-bold leading-tight">
                        {p.name}
                      </h3>
                      <span className="shrink-0 font-display text-base font-bold text-orange tabular-nums">
                        {formatTk(p.price)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-warm">
                      {p.categoryLabel} · <TagBadges p={p} />
                    </p>
                    <div className="mt-1.5">
                      <StatusBadges p={p} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-dashed border-ink/10 pt-2.5">
                  <p className="min-w-0 flex-1 truncate text-xs text-muted-warm">
                    {p.description || "No description"}
                  </p>
                  <span className="flex shrink-0 gap-0.5">{rowActions(p)}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Dialogs */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        categories={categories}
        onSaved={reload}
      />
      <CategoryManagerDialog
        open={catOpen}
        onOpenChange={setCatOpen}
        categories={categories}
        onChanged={reload}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl border-2 border-ink">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete “{deleteTarget?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from the site for good. Past orders keep their records. This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-2 border-ink/15 bg-white font-bold">
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="rounded-xl border-2 border-ink bg-[#e5484d] font-bold text-white shadow-[3px_3px_0_0_var(--color-ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
