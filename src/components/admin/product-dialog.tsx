"use client";

/**
 * Add / edit product dialog. Scrollable, mobile friendly.
 * Image uploads go to /api/admin/upload (type=product) and the returned url
 * is stored in the form. Save posts to /api/admin/products.
 */

import * as React from "react";
import Image from "next/image";
import { Check, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api, isUnauthorizedError, uploadImage } from "./api";
import type { AdminCategory, AdminProduct, ProductTag } from "./types";

interface ProductForm {
  name: string;
  categoryId: string;
  price: string;
  description: string;
  image: string;
  imageAlt: string;
  tags: ProductTag[];
  isActive: boolean;
  isSignature: boolean;
  signatureTag: string;
  signatureDescription: string;
}

const TAG_OPTIONS: { value: ProductTag; label: string; dot: string }[] = [
  { value: "popular", label: "Popular", dot: "bg-pink" },
  { value: "new", label: "New", dot: "bg-orange" },
  { value: "must-try", label: "Must try", dot: "bg-cyan" },
];

function toForm(p: AdminProduct | null, categories: AdminCategory[]): ProductForm {
  return {
    name: p?.name ?? "",
    categoryId: p?.categoryId ?? categories[0]?.id ?? "",
    price: p ? String(p.price) : "",
    description: p?.description ?? "",
    image: p?.image ?? "",
    imageAlt: p?.imageAlt ?? "",
    tags: p?.tags ?? [],
    isActive: p?.isActive ?? true,
    isSignature: p?.isSignature ?? false,
    signatureTag: p?.signatureTag ?? "",
    signatureDescription: p?.signatureDescription ?? "",
  };
}

const fieldErrorClass = "text-sm font-medium text-[#e5484d]";

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = create a new product */
  product: AdminProduct | null;
  categories: AdminCategory[];
  onSaved: () => void;
}) {
  const editing = product !== null;
  const [form, setForm] = React.useState<ProductForm>(() => toForm(null, categories));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Reset the form each time the dialog opens (or target changes while open).
  React.useEffect(() => {
    if (open) {
      setForm(toForm(product, categories));
      setErrors({});
      setUploading(false);
      setSaving(false);
    }
  }, [open, product, categories]);

  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function toggleTag(tag: ProductTag) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  }

  async function handleFile(file: File | undefined) {
    if (!file || uploading) return;
    setUploading(true);
    setErrors((e) => ({ ...e, image: "" }));
    try {
      const url = await uploadImage(file, "product");
      set("image", url);
      toast.success("Image uploaded");
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        const msg = err instanceof Error ? err.message : "Upload failed.";
        setErrors((e) => ({ ...e, image: msg }));
        toast.error(msg);
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || uploading) return;

    const priceNum = Number(form.price);
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Name needs at least 2 characters.";
    if (!form.categoryId) errs.categoryId = "Pick a category.";
    if (
      !form.price.trim() ||
      !Number.isFinite(priceNum) ||
      !Number.isInteger(priceNum) ||
      priceNum < 1 ||
      priceNum > 99999
    ) {
      errs.price = "Enter a whole taka amount (at least ৳1).";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: priceNum,
      description: form.description.trim(),
      image: form.image,
      imageAlt: form.imageAlt.trim(),
      tags: form.tags,
      isActive: form.isActive,
      isSignature: form.isSignature,
      signatureTag: form.signatureTag.trim(),
      signatureDescription: form.signatureDescription.trim(),
    };
    try {
      const path = "/api/admin/products";
      const body = editing ? { id: product.id, ...payload } : payload;
      await api(path, { method: editing ? "PATCH" : "POST", json: body });
      toast.success(editing ? "Product updated" : `“${payload.name}” added`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        const msg = err instanceof Error ? err.message : "Could not save.";
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="nice-scrollbar max-h-[92dvh] overflow-y-auto rounded-3xl border-2 border-ink sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editing ? `Edit ${product?.name ?? "product"}` : "Add product"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Changes go live on the site immediately."
              : "New products appear at the end of their category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Biscoff Bliss"
              maxLength={80}
              aria-invalid={!!errors.name}
              className="h-11 rounded-xl border-2 border-ink/15 bg-cream"
            />
            {errors.name && <p className={fieldErrorClass} role="alert">{errors.name}</p>}
          </div>

          {/* Category + price */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-category">Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                <SelectTrigger
                  id="product-category"
                  className="h-11 rounded-xl border-2 border-ink/15 bg-cream"
                >
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className={fieldErrorClass} role="alert">{errors.categoryId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (৳)</Label>
              <Input
                id="product-price"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="e.g. 219"
                aria-invalid={!!errors.price}
                className="h-11 rounded-xl border-2 border-ink/15 bg-cream tabular-nums"
              />
              {errors.price && <p className={fieldErrorClass} role="alert">{errors.price}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="product-desc">Description</Label>
            <Textarea
              id="product-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="One tasty line about it…"
              maxLength={300}
              rows={2}
              className="rounded-xl border-2 border-ink/15 bg-cream"
            />
            <p className="text-xs text-muted-warm">{form.description.length}/300</p>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="product-image">Photo</Label>
            <div className="flex items-start gap-3">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-ink/20 bg-cream text-muted-warm">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Upload preview"
                    className="max-h-40 h-full w-full object-cover"
                  />
                ) : uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <ImagePlus className="h-5 w-5" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {uploading ? (
                    <Button type="button" disabled className="h-9 rounded-lg bg-orange font-bold text-white">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Uploading…
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      asChild
                      className="h-9 rounded-lg border-2 border-ink bg-orange font-bold text-white shadow-[2px_2px_0_0_var(--color-ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                    >
                      <label htmlFor="product-image" className="cursor-pointer">
                        <Upload className="h-4 w-4" aria-hidden />
                        {form.image ? "Replace" : "Upload"}
                      </label>
                    </Button>
                  )}
                  {form.image && !uploading && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => set("image", "")}
                      className="h-9 rounded-lg border-2 border-ink/15 bg-white font-semibold text-muted-warm hover:border-[#e5484d]/50 hover:text-[#e5484d]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-warm">JPG, PNG or WebP · up to 8 MB.</p>
                {errors.image && <p className={fieldErrorClass} role="alert">{errors.image}</p>}
                <Input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <Label htmlFor="product-image-alt" className="text-muted-warm">
                Alt text <span className="font-normal">(for screen readers)</span>
              </Label>
              <Input
                id="product-image-alt"
                value={form.imageAlt}
                onChange={(e) => set("imageAlt", e.target.value)}
                placeholder={`e.g. ${form.name.trim() || "Biscoff Bliss"} on a stick`}
                maxLength={300}
                className="h-10 rounded-xl border-2 border-ink/15 bg-cream"
              />
            </div>
          </div>

          {/* Tags */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-bold">Badges</legend>
            <div className="grid grid-cols-3 gap-2">
              {TAG_OPTIONS.map((t) => (
                <label
                  key={t.value}
                  htmlFor={`tag-${t.value}`}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-xl border-2 border-ink/10 bg-cream px-3 py-2.5 text-sm font-semibold transition-colors has-[button[data-state=checked]]:border-pink/50 has-[button[data-state=checked]]:bg-pink-soft/40"
                >
                  <Checkbox
                    id={`tag-${t.value}`}
                    checked={form.tags.includes(t.value)}
                    onCheckedChange={() => toggleTag(t.value)}
                  />
                  <span className={cn("h-2 w-2 rounded-full", t.dot)} aria-hidden />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Visibility */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/10 bg-surface px-3.5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-bold">Visible on the site</p>
                <p className="text-xs text-muted-warm">Hidden items only show here.</p>
              </div>
              <Switch
                id="product-active"
                checked={form.isActive}
                onCheckedChange={(v) => set("isActive", v === true)}
                aria-label="Toggle site visibility"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/10 bg-surface px-3.5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-bold">Signature pick</p>
                <p className="text-xs text-muted-warm">Feature it in the home page picks.</p>
              </div>
              <Switch
                id="product-signature"
                checked={form.isSignature}
                onCheckedChange={(v) => set("isSignature", v === true)}
                aria-label="Toggle signature pick"
              />
            </div>

            {form.isSignature && (
              <div className="space-y-3 rounded-xl border-2 border-pink/30 bg-pink-soft/40 px-3.5 py-3.5">
                <div className="space-y-2">
                  <Label htmlFor="sig-tag">Badge label</Label>
                  <Input
                    id="sig-tag"
                    value={form.signatureTag}
                    onChange={(e) => set("signatureTag", e.target.value)}
                    placeholder="Must try"
                    maxLength={30}
                    className="h-10 rounded-xl border-2 border-ink/15 bg-white"
                  />
                  <p className="text-xs text-muted-warm">
                    Shown as the little ribbon on the home page card. Defaults to “Must try”.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sig-desc">Card copy</Label>
                  <Textarea
                    id="sig-desc"
                    value={form.signatureDescription}
                    onChange={(e) => set("signatureDescription", e.target.value)}
                    placeholder="One line about why it's special…"
                    maxLength={300}
                    rows={2}
                    className="rounded-xl border-2 border-ink/15 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="h-11 rounded-xl border-2 border-ink/15 bg-white px-4 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="h-11 rounded-xl border-2 border-ink bg-orange px-5 font-bold text-white shadow-[3px_3px_0_0_var(--color-ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Check className="h-4 w-4" aria-hidden />
              )}
              {editing ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
