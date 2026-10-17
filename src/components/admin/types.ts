/**
 * Shared TypeScript types for the admin panel.
 * These mirror the JSON contracts of the /api/admin/* routes (Task 8-a).
 */

export type OrderStatus = "new" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
export type ProductTag = "popular" | "new" | "must-try";
export type Fulfillment = "pickup" | "delivery";
export type PaymentMethod = "cash" | "bkash" | "nagad";

export interface AdminCategory {
  id: string;
  label: string;
  blurb: string;
  sortOrder: number;
  productCount: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageAlt: string;
  tags: ProductTag[];
  categoryId: string;
  categoryLabel: string;
  isActive: boolean;
  isSignature: boolean;
  signatureTag: string;
  signatureDescription: string;
  signatureSort: number;
  sortOrder: number;
  updatedAt: string;
}

export interface AdminOrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  fulfillment: Fulfillment | string;
  address: string | null;
  pickupTime: string;
  paymentMethod: PaymentMethod | string;
  trxId: string | null;
  notes: string | null;
  items: AdminOrderItem[];
  total: number;
  status: OrderStatus | string;
  createdAt: string;
}

export interface DailyPoint {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: OrderStatus | string;
  itemCount: number;
  createdAt: string;
}

export interface AdminAnalytics {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    activeProducts: number;
  };
  daily: DailyPoint[];
  topProducts: TopProduct[];
  statusBreakdown: { status: OrderStatus | string; count: number }[];
  recentOrders: RecentOrder[];
}

export interface AdminSettings {
  heroImage: string;
  heroImageAlt: string;
}
