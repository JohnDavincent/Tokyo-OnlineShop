/**
 * Mock data for admin panel features the backend does not support yet.
 * Every consumer of this module renders a "Mock data — backend pending"
 * badge next to the affected UI.
 *
 * TODO: connect to backend — delete entries from this file as the
 * corresponding endpoints land:
 *   - Admin-wide transaction list (with customer + status filters)
 *   - Customer/member list + membership detail
 *   - Vouchers (issue + list per customer)
 *   - Sales/profit statistics
 *   - Homepage banner management
 */

import type { TransactionStatus } from "./transactionService";

/* --- Transactions ------------------------------------------ */

export interface MockTransaction {
  transactionId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  status: TransactionStatus;
  grandTotal: number;
  itemCount: number;
  createdAt: string; // ISO date
  isMock: true;
}

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  { transactionId: "mock-trx-001", orderId: "TG-20260705-0917", customerName: "Dewi Lestari", customerPhone: "0812-3345-1102", status: "PENDING", grandTotal: 486500, itemCount: 7, createdAt: "2026-07-05T09:17:00", isMock: true },
  { transactionId: "mock-trx-002", orderId: "TG-20260705-0844", customerName: "Budi Santoso", customerPhone: "0813-9921-4471", status: "PENDING", grandTotal: 152000, itemCount: 3, createdAt: "2026-07-05T08:44:00", isMock: true },
  { transactionId: "mock-trx-003", orderId: "TG-20260704-1732", customerName: "Siti Rahayu", customerPhone: "0821-5560-8934", status: "SUCCESS", grandTotal: 823000, itemCount: 12, createdAt: "2026-07-04T17:32:00", isMock: true },
  { transactionId: "mock-trx-004", orderId: "TG-20260704-1501", customerName: "Agus Wijaya", customerPhone: "0857-2210-6645", status: "SUCCESS", grandTotal: 264500, itemCount: 5, createdAt: "2026-07-04T15:01:00", isMock: true },
  { transactionId: "mock-trx-005", orderId: "TG-20260704-1128", customerName: "Rina Hartati", customerPhone: "0838-7745-2210", status: "FAILED", grandTotal: 97000, itemCount: 2, createdAt: "2026-07-04T11:28:00", isMock: true },
  { transactionId: "mock-trx-006", orderId: "TG-20260703-1954", customerName: "Hendra Gunawan", customerPhone: "0812-8890-3321", status: "SUCCESS", grandTotal: 1240000, itemCount: 18, createdAt: "2026-07-03T19:54:00", isMock: true },
  { transactionId: "mock-trx-007", orderId: "TG-20260703-1420", customerName: "Maya Kusuma", customerPhone: "0819-4432-7788", status: "PENDING", grandTotal: 315500, itemCount: 6, createdAt: "2026-07-03T14:20:00", isMock: true },
  { transactionId: "mock-trx-008", orderId: "TG-20260702-1015", customerName: "Dewi Lestari", customerPhone: "0812-3345-1102", status: "SUCCESS", grandTotal: 542000, itemCount: 9, createdAt: "2026-07-02T10:15:00", isMock: true },
  { transactionId: "mock-trx-009", orderId: "TG-20260701-1633", customerName: "Joko Prasetyo", customerPhone: "0856-1123-9080", status: "FAILED", grandTotal: 189000, itemCount: 4, createdAt: "2026-07-01T16:33:00", isMock: true },
  { transactionId: "mock-trx-010", orderId: "TG-20260701-0906", customerName: "Lina Marlina", customerPhone: "0821-6678-5511", status: "SUCCESS", grandTotal: 738500, itemCount: 11, createdAt: "2026-07-01T09:06:00", isMock: true },
];

export interface MockTransactionItem {
  productName: string;
  productUnit: string;
  price: number;
  quantity: number;
  subTotal: number;
}

export const MOCK_TRANSACTION_ITEMS: Record<string, MockTransactionItem[]> = {
  "mock-trx-001": [
    { productName: "Beras Jiva", productUnit: "boxs", price: 80000, quantity: 4, subTotal: 320000 },
    { productName: "Minyak Goreng Sania 2L", productUnit: "pcs", price: 38500, quantity: 3, subTotal: 115500 },
    { productName: "Gula Pasir Gulaku 1kg", productUnit: "pcs", price: 17000, quantity: 3, subTotal: 51000 },
  ],
  "mock-trx-002": [
    { productName: "Indomie Goreng", productUnit: "pack", price: 42000, quantity: 2, subTotal: 84000 },
    { productName: "Biskuit Ahah", productUnit: "pcs", price: 7000, quantity: 4, subTotal: 28000 },
    { productName: "Teh Botol Sosro", productUnit: "pack", price: 40000, quantity: 1, subTotal: 40000 },
  ],
};

export const MOCK_TRANSACTION_FALLBACK_ITEMS: MockTransactionItem[] = [
  { productName: "Beras Jiva", productUnit: "boxs", price: 80000, quantity: 2, subTotal: 160000 },
  { productName: "Indomie Goreng", productUnit: "pack", price: 42000, quantity: 1, subTotal: 42000 },
];

/* --- Customers & vouchers ----------------------------------- */

export type MembershipTier = "REGULAR" | "VIP";

export interface MockVoucher {
  voucherId: string;
  code: string;
  description: string;
  discountLabel: string;
  targetTier: MembershipTier;
  expiresAt: string;
  used: boolean;
}

export interface MockCustomer {
  id: string;
  name: string;
  phoneNumber: string;
  membership: MembershipTier;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  vouchers: MockVoucher[];
}

export const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: "mock-cust-001", name: "Dewi Lestari", phoneNumber: "0812-3345-1102", membership: "VIP",
    joinedAt: "2025-11-02", totalOrders: 34, totalSpent: 8420000,
    vouchers: [
      { voucherId: "v-101", code: "VIPJULY15", description: "15% off groceries", discountLabel: "15%", targetTier: "VIP", expiresAt: "2026-07-31", used: false },
      { voucherId: "v-102", code: "FREESHIP50", description: "Free delivery min. Rp 50.000", discountLabel: "Free delivery", targetTier: "VIP", expiresAt: "2026-07-15", used: true },
    ],
  },
  {
    id: "mock-cust-002", name: "Budi Santoso", phoneNumber: "0813-9921-4471", membership: "REGULAR",
    joinedAt: "2026-01-18", totalOrders: 6, totalSpent: 940000,
    vouchers: [
      { voucherId: "v-103", code: "WELCOME10", description: "10% off first 3 orders", discountLabel: "10%", targetTier: "REGULAR", expiresAt: "2026-08-01", used: false },
    ],
  },
  {
    id: "mock-cust-003", name: "Siti Rahayu", phoneNumber: "0821-5560-8934", membership: "VIP",
    joinedAt: "2025-08-27", totalOrders: 51, totalSpent: 14350000,
    vouchers: [
      { voucherId: "v-104", code: "VIPJULY15", description: "15% off groceries", discountLabel: "15%", targetTier: "VIP", expiresAt: "2026-07-31", used: false },
    ],
  },
  {
    id: "mock-cust-004", name: "Agus Wijaya", phoneNumber: "0857-2210-6645", membership: "REGULAR",
    joinedAt: "2026-03-05", totalOrders: 11, totalSpent: 1720000, vouchers: [],
  },
  {
    id: "mock-cust-005", name: "Rina Hartati", phoneNumber: "0838-7745-2210", membership: "REGULAR",
    joinedAt: "2026-05-22", totalOrders: 2, totalSpent: 286000,
    vouchers: [
      { voucherId: "v-105", code: "WELCOME10", description: "10% off first 3 orders", discountLabel: "10%", targetTier: "REGULAR", expiresAt: "2026-08-01", used: false },
    ],
  },
  {
    id: "mock-cust-006", name: "Hendra Gunawan", phoneNumber: "0812-8890-3321", membership: "VIP",
    joinedAt: "2025-06-14", totalOrders: 67, totalSpent: 21080000,
    vouchers: [
      { voucherId: "v-106", code: "FREESHIP50", description: "Free delivery min. Rp 50.000", discountLabel: "Free delivery", targetTier: "VIP", expiresAt: "2026-07-15", used: false },
    ],
  },
  {
    id: "mock-cust-007", name: "Maya Kusuma", phoneNumber: "0819-4432-7788", membership: "REGULAR",
    joinedAt: "2026-02-09", totalOrders: 9, totalSpent: 1130000, vouchers: [],
  },
  {
    id: "mock-cust-008", name: "Joko Prasetyo", phoneNumber: "0856-1123-9080", membership: "REGULAR",
    joinedAt: "2026-06-01", totalOrders: 1, totalSpent: 189000, vouchers: [],
  },
];

/* --- Sales analytics ---------------------------------------- */

export interface MonthlySalesPoint {
  month: string;
  revenue: number;
  profit: number;
  orders: number;
}

export const MOCK_MONTHLY_SALES: MonthlySalesPoint[] = [
  { month: "Jan", revenue: 42500000, profit: 9350000, orders: 312 },
  { month: "Feb", revenue: 39800000, profit: 8756000, orders: 287 },
  { month: "Mar", revenue: 51200000, profit: 11780000, orders: 356 },
  { month: "Apr", revenue: 48600000, profit: 10692000, orders: 341 },
  { month: "May", revenue: 55900000, profit: 12857000, orders: 389 },
  { month: "Jun", revenue: 61400000, profit: 14736000, orders: 428 },
  { month: "Jul", revenue: 12800000, profit: 3072000, orders: 94 },
];

export interface CategorySalesPoint {
  category: string;
  revenue: number;
  share: number; // percent
}

export const MOCK_CATEGORY_SALES: CategorySalesPoint[] = [
  { category: "Beras", revenue: 18200000, share: 30 },
  { category: "Minyak & Bumbu", revenue: 12100000, share: 20 },
  { category: "Snack", revenue: 9700000, share: 16 },
  { category: "Minuman", revenue: 8500000, share: 14 },
  { category: "Frozen", revenue: 6900000, share: 11 },
  { category: "Lainnya", revenue: 5500000, share: 9 },
];

export interface WeeklySalesPoint {
  day: string;
  itemsSold: number;
}

export const MOCK_WEEKLY_ITEMS_SOLD: WeeklySalesPoint[] = [
  { day: "Mon", itemsSold: 182 },
  { day: "Tue", itemsSold: 141 },
  { day: "Wed", itemsSold: 168 },
  { day: "Thu", itemsSold: 210 },
  { day: "Fri", itemsSold: 254 },
  { day: "Sat", itemsSold: 331 },
  { day: "Sun", itemsSold: 298 },
];

export const MOCK_SALES_TOTALS = {
  totalRevenue: 312200000,
  totalProfit: 71243000,
  totalItemsSold: 18432,
  totalOrders: 2207,
  averageOrderValue: 141459,
  lowStockCount: 7,
};

/* --- Site control (homepage banners) ------------------------ */

export interface MockBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
  tone: "green" | "amber";
}

export const MOCK_BANNERS: MockBanner[] = [
  {
    id: "banner-1",
    title: "Fresh Groceries, Delivered Fast",
    subtitle: "Free delivery on orders above Rp 150.000 this week",
    ctaLabel: "Shop now",
    ctaHref: "/product/category",
    active: true,
    tone: "green",
  },
  {
    id: "banner-2",
    title: "Flash Sale Friday",
    subtitle: "Up to 40% off selected staples, every Friday",
    ctaLabel: "See deals",
    ctaHref: "/product/category",
    active: true,
    tone: "amber",
  },
  {
    id: "banner-3",
    title: "New Member Perks",
    subtitle: "Register today and get a 10% welcome voucher",
    ctaLabel: "Join Tokyo GO",
    ctaHref: "/register",
    active: false,
    tone: "green",
  },
];
