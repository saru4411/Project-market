// =============================================================
// IndiTrade B2B Storefront – Shared TypeScript Definitions
// =============================================================

// ── API / Domain Models ──────────────────────────────────────

export interface Supplier {
  id: number;
  name: string;
  location: string;
  state?: string;
  gstin?: string;
  iso?: string;
  trustScore?: string;
  responseTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceTier {
  min: number;
  max?: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  hub: string;
  moq: number;
  unit: string;
  hsn?: string;
  description?: string;
  image?: string;
  images?: string[];
  weightPerUnit?: number;
  leadTime?: string;
  tiers?: PriceTier[];
  /** Sequelize association (lowercase) */
  supplier?: Supplier;
  /** Sequelize association (PascalCase) */
  Supplier?: Supplier;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bid {
  id?: number;
  supplierName?: string;
  supplier?: string;
  bidPrice: number;
  logistics?: string;
}

export interface Rfq {
  id: number;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit?: string;
  targetPrice?: number;
  buyerName?: string;
  datePosted?: string;
  status?: string;
  bids?: Bid[];
}

export interface Order {
  id: number;
  orderCode?: string;
  productName?: string;
  quantity: number;
  total?: number;
  status?: string;
  buyerName?: string;
  supplierId?: number;
  /** Sequelize association (PascalCase) */
  SupplierId?: number;
  createdAt?: string;
}

export interface Inquiry {
  id: number;
  buyerName: string;
  productName: string;
  message: string;
  date?: string;
  supplierId?: number;
}

export interface User {
  id?: number;
  name: string;
  email?: string;
  role: 'buyer' | 'supplier' | 'admin';
  sellerStatus?: 'none' | 'pending_docs' | 'pending_approval' | 'approved';
  /** Set after buyer is approved as a supplier */
  supplierId?: number;
}

// ── Escrow / Compute Service Types ───────────────────────────

export interface ShippingOption {
  carrier: string;
  name: string;
  cost: number;
  transitDays: number;
  type: string;
  isRecommended: boolean;
  isCheapest: boolean;
  recommendationReason?: string;
}

export interface CalcSuborder {
  productName: string;
  quantity: number;
  subtotal: number;
  taxType: string;
  orderCode?: string;
  tax?: number;
  freight?: number;
  total?: number;
}

export interface CalcResult {
  parentCode: string;
  grandSubtotal: number;
  grandTax: number;
  grandFreight: number;
  grandTotal: number;
  message?: string;
  suborders?: CalcSuborder[];
  shippingOptions?: ShippingOption[];
  distanceKm?: number;
  chargeableWeight?: number;
  deadWeight?: number;
  volumetricWeight?: number;
}

// ── UI / Domain Constants ─────────────────────────────────────

export interface SourcingHub {
  id: string;
  name: string;
  location: string;
  category: string;
  count: string;
  icon: string;
}

// ── Named tab values ──────────────────────────────────────────

export type ActiveTab =
  | 'marketplace'
  | 'rfqs'
  | 'product-detail'
  | 'supplier-dashboard'
  | 'intent-selector'
  | 'seller-onboarding'
  | 'admin-dashboard'
  | 'beckn-sourcing'
  | 'sourcing-radar'
  | 'ai-hsn-expert'
  | 'safetrade-orders';

export type DetailTab = 'description' | 'supplier' | 'shipping';

export type UserRole = 'buyer' | 'supplier';

// ── Pending seller (admin view) ───────────────────────────────

export interface PendingSeller {
  id: number;
  name: string;
  email: string;
  sellerStatus: string;
  gstin?: string;
  iso?: string;
  location?: string;
  state?: string;
  createdAt?: string;
}
