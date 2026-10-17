"use client";

/**
 * Category management dialog: add, rename (label + blurb), delete.
 * Delete is blocked (with an explanation) while a category still has products.
 */

import * as React from "react";
import { Check, Loader2, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api, isUnauthorizedError } from "./api";
import type { AdminCategory } from "./types";

export function CategoryManagerDialog({
  open,
  onOpenChange,
  categories,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: AdminCategory[];
  /** call after any mutation so the parent refetches and feeds us fresh data */
  onChanged: () => void;
}) {
  const [addLabel, setAddLabel] = React.useState("");
  const [addBlurb, setAddBlurb] = React.useState("");
  const [addError, setAddError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);

  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameLabel, setRenameLabel] = React.useState("");
  const [renameBlurb, setRenameBlurb] = React.useState("");
  const [renameBusy, setRenameBusy] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const busy = adding || renameBusy || deleting;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (adding) return;
    const label = addLabel.trim();
    if (label.length < 2) {
      setAddError("Category names need at least 2 characters.");
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      await api("/api/admin/categories", {
        method: "POST",
        json: { label, blurb: addBlurb.trim() },
      });
      toast.success(`“${label}” category added`);
      setAddLabel("");
      setAddBlurb("");
      onChanged();
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        const msg = err instanceof Error ? err.message : "Could not add the category.";
        setAddError(msg);
        toast.error(msg);
      }
    } finally {
      setAdding(false);
    }
  }

  function startRename(c: AdminCategory) {
    setRenamingId(c.id);
    setRenameLabel(c.label);
    setRenameBlurb(c.blurb);
  }

  async function handleRename(c: AdminCategory) {
    if (renameBusy) return;
    const label = renameLabel.trim();
    if (label.length < 2) {
      toast.error("Category names need at least 2 characters.");
      return;
    }
    setRenameBusy(true);
    try {
      await api("/api/admin/categories", {
        method: "PATCH",
        json: { id: c.id, label, blurb: renameBlurb.trim() },
      });
      toast.success("Category updated");
      setRenamingId(null);
      onChanged();
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Could not update the category.");
      }
    } finally {
      setRenameBusy(false);
    }
  }

  async function handleDelete() {
    const target = deleteTarget;
    if (!target || deleting) return;
    setDeleting(true);
    try {
      await api(`/api/admin/categories?id=${encodeURIComponent(target.id)}`, {
        method: "DELETE",
      });
      toast.success(`“${target.label}” deleted`);
      setDeleteTarget(null);
      onChanged();
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Could not delete the category.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="nice-scrollbar max-h-[92dvh] overflow-y-auto rounded-3xl border-2 border-ink sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Categories</DialogTitle>
            <DialogDescription>
              Groups used on the menu page. A category can only be deleted once it&apos;s empty.
            </DialogDescription>
          </DialogHeader>

          {/* Add form */}
          <form
            onSubmit={handleAdd}
            className="space-y-2 rounded-xl border-2 border-dashed border-ink/20 bg-cream p-3"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-cat-name" className="text-muted-warm">
                New category
              </Label>
              <div className="flex gap-2">
                <Input
                  id="new-cat-name"
                  value={addLabel}
                  onChange={(e) => {
                    setAddLabel(e.target.value);
                    setAddError(null);
                  }}
                  placeholder="e.g. Seasonal specials"
                  maxLength={60}
                  className="h-10 rounded-lg border-2 border-ink/15 bg-white"
                />
                <Button
                  type="submit"
                  disabled={adding}
                  className="h-10 shrink-0 rounded-lg border-2 border-ink bg-orange px-3 font-bold text-white shadow-[2px_2px_0_0_var(--color-ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden />
                  )}
                  Add
                </Button>
              </div>
            </div>
            <Input
              value={addBlurb}
              onChange={(e) => setAddBlurb(e.target.value)}
              placeholder="Tagline (optional) — e.g. “Back for winter only”"
              maxLength={200}
              aria-label="New category tagline"
              className="h-9 rounded-lg border-2 border-ink/15 bg-white text-sm"
            />
            {addError && (
              <p role="alert" className="text-sm font-medium text-[#e5484d]">
                {addError}
              </p>
            )}
          </form>

          {/* List */}
          {categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-warm">
              No categories yet — add the first one above.
            </p>
          ) : (
            <ul className="space-y-2">
              {categories.map((c) =>
                renamingId === c.id ? (
                  <li
                    key={c.id}
                    className="space-y-2 rounded-xl border-2 border-pink/40 bg-pink-soft/30 p-3"
                  >
                    <Label htmlFor={`rename-${c.id}`} className="text-muted-warm">
                      Rename “{c.label}”
                    </Label>
                    <Input
                      id={`rename-${c.id}`}
                      value={renameLabel}
                      onChange={(e) => setRenameLabel(e.target.value)}
                      maxLength={60}
                      className="h-10 rounded-lg border-2 border-ink/15 bg-white"
                    />
                    <Input
                      value={renameBlurb}
                      onChange={(e) => setRenameBlurb(e.target.value)}
                      placeholder="Tagline (optional)"
                      maxLength={200}
                      aria-label="Category tagline"
                      className="h-9 rounded-lg border-2 border-ink/15 bg-white text-sm"
                    />
                    <div className="flex justify-end gap-2 pt-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRenamingId(null)}
                        disabled={renameBusy}
                        className="h-9 rounded-lg border-2 border-ink/15 bg-white px-3 font-semibold"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleRename(c)}
                        disabled={renameBusy}
                        className="h-9 rounded-lg border-2 border-ink bg-ink px-3 font-bold text-cream shadow-[2px_2px_0_0_var(--color-pink)]"
                      >
                        {renameBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Check className="h-4 w-4" aria-hidden />
                        )}
                        Save
                      </Button>
                    </div>
                  </li>
                ) : (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 rounded-xl border-2 border-ink/10 bg-surface p-3"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-ink/10 bg-cream text-muted-warm",
                        c.productCount === 0 && "opacity-60"
                      )}
                      aria-hidden
                    >
                      <Tags className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {c.label}
                        <span className="ml-1.5 rounded-full bg-cream px-2 py-0.5 text-[0.62rem] font-bold text-muted-warm tabular-nums">
                          {c.productCount} item{c.productCount === 1 ? "" : "s"}
                        </span>
                      </p>
                      <p className="truncate text-xs text-muted-warm">
                        {c.blurb || "No tagline"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => startRename(c)}
                      disabled={busy}
                      aria-label={`Rename ${c.label}`}
                      className="h-9 w-9 shrink-0 rounded-lg hover:bg-cream"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(c)}
                      disabled={busy || c.productCount > 0}
                      aria-label={
                        c.productCount > 0
                          ? `${c.label} still has products — move or delete them first`
                          : `Delete ${c.label}`
                      }
                      title={
                        c.productCount > 0
                          ? "Move or delete its products first"
                          : `Delete ${c.label}`
                      }
                      className="h-9 w-9 shrink-0 rounded-lg text-[#e5484d] hover:bg-[#e5484d]/10 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </li>
                )
              )}
            </ul>
          )}
        </DialogContent>
      </Dialog>

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
              Delete “{deleteTarget?.label}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The category is empty, so it can go. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-2 border-ink/15 bg-white font-bold">
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // prevent auto-close so the busy state is visible; we close on success
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
    </>
  );
}
