export type TApiResponse<T> = {
  data: T;
  message?: string;
  success?: boolean;
  meta?: TMeta;
};

export type TMeta = {
  limit: number;
  page: number;
  total: number;
  // totalPage: number;
};

export type ResponseSuccessType = {
  data: unknown;
  meta?: TMeta;
}

export type IGenericErrorMessage = {
  path?: string | number;
  message?: string;
  statusCode?: number;
  errorMessages?: string
};

export type TApiError = {
  status?: number | string;
  data?: {
    message?: string;
    errorMessages?: IGenericErrorMessage[];
    stack?: string;
  } | string;
  message?: string;
};


export interface TCategory {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TProductStatus = 'active' | 'out_of_stock' | 'low_stock';

export interface TProduct {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  category: string | TCategory;
  thumbnail: string;
  price: number;
  status?: TProductStatus;
  stockQuantity?: number;
  minStockThreshold?: number;
  restockIgnored?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export type TOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';




export interface TShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  country?: string;
}

export interface TStatusHistoryEntry {
  status: TOrderStatus;
  note?: string;
  changedAt?: Date;
}

// ── Main Order Interface ───────────────────────────────────────────────────────
export interface TOrder {
  _id?: string;
  // user: Types.ObjectId;
  productId: string;
  customerName: string;
  productName: string;
  price: number;
  quantity: number;
  shippingAddress: TShippingAddress;
  subtotal: number;
  totalAmount: number;
  statusHistory: TStatusHistoryEntry[];
  discount?: number;
  orderStatus?: TOrderStatus;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TActivity {
  _id: string;
  action: string;
  message: string;
  performedBy: string;
  createdAt: string;
}

export interface TChartDataItem {
  name: string;
  revenue: number;
}
