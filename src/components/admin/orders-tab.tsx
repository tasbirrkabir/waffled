"use client";

/**
 * Orders tab: status filter chips + search, responsive list (table on desktop,
 * cards on mobile) with expandable details, status updates and deletion.
 */

import * as React from "react";
import {
  Bike,
  ChevronDown,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  StickyNote,
  Store,
  Trash2,
  X,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ORDER_STATUSES, StatusBadge, asStatus, statusMeta } from "./status-badge";
import {
  formatDateTime,
  formatShortDateTime,
  fulfillmentLabel,
  paymentLabel,
  telHref,
} from "./utils";
import { EmptyState, ErrorState, TabToolbar } from "./ui-bits";
import type { AdminOrder, AdminOrderItem, OrderStatus } from "./types";

const FILTERS: { value: "all" | OrderStatus; label: string }[] = [
  { value: "all", label: "All" },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: statusMeta[s].label })),
];

function FulfillmentChip({ order }: { order: AdminOrder }) {
  const delivery = order.fulfillment === "delivery";
  const Icon = delivery ? Bike : Store;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider",
        delivery
          ? "border-purple/30 bg-purple-soft text-purple"
          : "border-border-warm bg-cream text-muted-warm"
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {fulfillmentLabel(order.fulfillment)}
    </span>
  );
}

function ItemLine({ item }: { item: AdminOrderItem }) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
      <span className="min-w-0 truncate">
        <span className="font-bold tabular-nums text-orange">{item.qty}×</span>{" "}
        {item.name}
      </span>
      <span className="shrink-0 font-semibold tabular-nums text-muted-warm">
        {formatTk(item.price * item.qty)}
      </span>
    </li>
  );
}

/** Expandable details shared by the table row and the mobile card. */
function OrderDetails({
  order,
  updating,
  onStatusChange,
  onDeleteRequest,
}: {
  order: AdminOrder;
  updating: boolean;
  onStatusChange: (order: AdminOrder, next: OrderStatus) => void;
  onDeleteRequest: (order: AdminOrder) => void;
}) {
  const delivery = order.fulfillment === "delivery";
  const paid = order.paymentMethod !== "cash";
  return (
    <div className="grid gap-4 p-1 sm:grid-cols-2">
      {/* left: items + notes */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-warm">Items</p>
          <ul className="mt-2 divide-y-2 divide-ink/5 rounded-xl border-2 border-ink/10 bg-surface">
            {order.items.map((it) => (
              <ItemLine key={it.id} item={it} />
            ))}
            <li className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-warm">
                Total
              </span>
              <span className="font-display text-base font-bold text-orange tabular-nums">
                {formatTk(order.total)}
              </span>
            </li>
          </ul>
        </div>
        {order.notes && (
          <div className="rounded-xl border-2 border-dashed border-orange/40 bg-orange-soft/50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange">
              <StickyNote className="h-3.5 w-3.5" aria-hidden />
              Note from the customer
            </p>
            <p className="mt-1.5 text-sm">{order.notes}</p>
          </div>
        )}
      </div>

      {/* right: logistics + controls */}
      <div className="space-y-3">
        <dl className="space-y-2.5 rounded-xl border-2 border-ink/10 bg-surface p-3.5 text-sm">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-warm">
                {delivery ? "Delivery address" : "Fulfilment"}
              </dt>
              <dd className="mt-0.5">
                {delivery ? order.address || "—" : "Pickup from the shop"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-warm">
                {delivery ? "Preferred time" : "Pickup time"}
              </dt>
              <dd className="mt-0.5">{order.pickupTime}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-warm">
                Payment
              </dt>
              <dd className="mt-0.5">
                {paymentLabel(order.paymentMethod)}
                {delivery ? " (pay on delivery)" : " (pay on pickup)"}
                {paid && order.trxId && (
                  <span className="ml-1.5 rounded-full border border-cyan/40 bg-cyan-soft px-2 py-0.5 text-[0.62rem] font-bold text-cyan">
                    TrxID {order.trxId}
                  </span>
                )}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5 border-t-2 border-dashed border-ink/10 pt-2.5">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-warm" aria-hidden />
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-warm">
                Placed
              </dt>
              <dd className="mt-0.5">{formatDateTime(order.createdAt)}</dd>
            </div>
          </div>
        </dl>

        <div className="rounded-xl border-2 border-ink/10 bg-surface p-3.5">
          <Label
            htmlFor={`status-${order.id}`}
            className="text-xs font-bold uppercase tracking-wider text-muted-warm"
          >
            Update status
          </Label>
          <Select
            value={asStatus(order.status)}
            onValueChange={(v) => onStatusChange(order, v as OrderStatus)}
            disabled={updating}
          >
            <SelectTrigger
              id={`status-${order.id}`}
              className="mt-1.5 h-11 w-full rounded-xl border-2 border-ink/15 bg-cream"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusMeta[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-3 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteRequest(order)}
              className="h-9 rounded-lg border-2 border-[#e5484d]/30 bg-white font-bold text-[#e5484d] hover:border-[#e5484d] hover:bg-[#e5484d]/10"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrdersTab() {
  const [statusFilter, setStatusFilter] = React.useState<"all" | OrderStatus>("all");
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminOrder | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // debounce the search box
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const loader = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (debouncedQ.trim()) params.set("q", debouncedQ.trim());
    const res = await api<{ orders: AdminOrder[] }>(`/api/admin/orders?${params.toString()}`);
    return res.orders;
  }, [statusFilter, debouncedQ]);
  const { data, loading, error, reload } = useAdminData(loader);

  const orders = data ?? [];

  async function handleStatusChange(order: AdminOrder, next: OrderStatus) {
    if (next === order.status || updatingId) return;
    setUpdatingId(order.id);
    try {
      await api("/api/admin/orders", {
        method: "PATCH",
        json: { id: order.id, status: next },
      });
      toast.success(`${order.orderNumber} marked as ${statusMeta[next].label.toLowerCase()}`);
      reload();
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Could not update the status.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    const target = deleteTarget;
    if (!target || deleting) return;
    setDeleting(true);
    try {
      await api(`/api/admin/orders?id=${encodeURIComponent(target.id)}`, { method: "DELETE" });
      toast.success(`${target.orderNumber} deleted`);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast.error(err instanceof Error ? err.message : "Could not delete the order.");
      }
    } finally {
      setDeleting(false);
    }
  }

  function toggleExpanded(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <TabToolbar title="Orders" onRefresh={reload} refreshing={loading} />
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  const hasFilters = statusFilter !== "all" || debouncedQ.trim().length > 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      <TabToolbar
        title="Orders"
        count={loading && !data ? undefined : orders.length}
        sub="Tap an order to see items, payment and delivery details."
        onRefresh={reload}
        refreshing={loading}
      />

      {/* Filters + search */}
      <div className="space-y-3">
        <div
          role="group"
          aria-label="Filter orders by status"
          className="flex gap-2 overflow-x-auto pb-1 nice-scrollbar"
        >
          {FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                aria-pressed={active}
                className={cn(
                  "h-9 shrink-0 rounded-full border-2 px-4 text-xs font-bold transition-all sm:text-sm",
                  active
                    ? "border-ink bg-ink text-cream shadow-[2px_2px_0_0_var(--color-pink)]"
                    : "border-ink/15 bg-surface text-muted-warm hover:border-ink/40"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-warm"
            aria-hidden
          />
          <input
            type="text"
            inputMode="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, name or phone"
            aria-label="Search orders"
            className="h-11 w-full rounded-xl border-2 border-ink/15 bg-surface pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-muted-warm focus:border-pink"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-warm hover:bg-cream hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading && !data ? (
        <div className="space-y-3" aria-label="Loading orders">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={hasFilters ? "No orders match" : "No orders yet"}
          hint={
            hasFilters
              ? "Try a different status chip or clear the search."
              : "When a customer places an order it lands here."
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setQ("");
                }}
                className="rounded-xl border-2 border-ink/15 bg-surface font-bold"
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border-2 border-ink/10 bg-surface md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Fulfilment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">Expand order</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const expanded = expandedId === o.id;
                  return (
                    <React.Fragment key={o.id}>
                      <TableRow
                        onClick={() => toggleExpanded(o.id)}
                        className={cn(
                          "cursor-pointer",
                          expanded && "bg-cream/70",
                          o.status === "cancelled" && "opacity-60"
                        )}
                      >
                        <TableCell className="py-3 font-display text-sm font-bold">
                          {o.orderNumber}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="block text-sm font-semibold">{o.customerName}</span>
                          <a
                            href={telHref(o.phone)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-muted-warm underline-offset-2 hover:text-pink hover:underline"
                          >
                            {o.phone}
                          </a>
                        </TableCell>
                        <TableCell className="py-3">
                          <FulfillmentChip order={o} />
                        </TableCell>
                        <TableCell className="py-3 text-right font-display font-bold text-orange tabular-nums">
                          {formatTk(o.total)}
                        </TableCell>
                        <TableCell className="py-3">
                          <StatusBadge status={o.status} />
                        </TableCell>
                        <TableCell className="py-3 text-xs text-muted-warm">
                          {formatShortDateTime(o.createdAt)}
                        </TableCell>
                        <TableCell className="py-3">
                          <ChevronDown
                            aria-hidden
                            className={cn(
                              "h-5 w-5 text-muted-warm transition-transform",
                              expanded && "rotate-180 text-pink"
                            )}
                          />
                        </TableCell>
                      </TableRow>
                      {expanded && (
                        <TableRow className="bg-cream/50 hover:bg-cream/50">
                          <TableCell colSpan={7} className="border-t-0 py-4">
                            <OrderDetails
                              order={o}
                              updating={updatingId === o.id}
                              onStatusChange={handleStatusChange}
                              onDeleteRequest={(ord) => setDeleteTarget(ord)}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {orders.map((o) => {
              const expanded = expandedId === o.id;
              const updating = updatingId === o.id;
              return (
                <li
                  key={o.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border-2 bg-surface",
                    expanded ? "border-pink/50" : "border-ink/10",
                    o.status === "cancelled" && "opacity-70"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(o.id)}
                    aria-expanded={expanded}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-display text-base font-bold leading-tight">
                          {o.orderNumber}
                        </p>
                        <a
                          href={telHref(o.phone)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 block text-xs font-semibold text-muted-warm hover:text-pink"
                        >
                          {o.customerName} · {o.phone}
                        </a>
                      </div>
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "h-5 w-5 shrink-0 text-muted-warm transition-transform",
                          expanded && "rotate-180 text-pink"
                        )}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge status={o.status} />
                      <FulfillmentChip order={o} />
                      <span className="ml-auto font-display text-base font-bold text-orange tabular-nums">
                        {formatTk(o.total)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-warm">
                      {formatShortDateTime(o.createdAt)} · {o.items.length} item
                      {o.items.length === 1 ? "" : "s"}
                    </p>
                  </button>
                  {expanded && (
                    <div className="border-t-2 border-dashed border-ink/10 bg-cream/60 p-4">
                      {updating && (
                        <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-warm">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          Updating status…
                        </p>
                      )}
                      <OrderDetails
                        order={o}
                        updating={updating}
                        onStatusChange={handleStatusChange}
                        onDeleteRequest={(ord) => setDeleteTarget(ord)}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

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
              Delete {deleteTarget?.orderNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This wipes the order for good — usually you want “cancelled” instead. This
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
