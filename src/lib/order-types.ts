import { CartItem, CertificateFormat, CustomerData } from "@/lib/types";

export type StoredOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "IN_ANALYSIS"
  | "CANCELLED";

export type StoredPaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface StoredOrderItem {
  id: string;
  category: string;
  certificateType: string;
  certificateName: string;
  state: string;
  city: string;
  cartorioId?: string;
  cartorioName?: string;
  isUnknownCartorio: boolean;
  documentData: Record<string, string>;
  format: CertificateFormat;
  hasApostille: boolean;
  hasShipping: boolean;
  listPrice: number;
  itemPrice: number;
  searchFee: number;
  apostilleFee: number;
  shippingPrice: number;
  totalPrice: number;
  referenceTag?: string;
  estimatedDays?: string;
}

export interface StoredPayment {
  id: string;
  provider: "MERCADOPAGO";
  providerPaymentId?: string;
  paymentMethod: "PIX";
  status: StoredPaymentStatus;
  amount: number;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  demo?: boolean;
}

export interface StoredOrder {
  id: string;
  orderNumber: number;
  protocol: string;
  channel: "CARTORI" | "PARTNER";
  kind: "OWN" | "RESELL";
  sellerOrgId: string | null;
  status: StoredOrderStatus;
  totalAmount: number;
  itemsTotal: number;
  shippingTotal: number;
  discountTotal: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpfCnpj: string;
  isCompany: boolean;
  companyName?: string;
  oabOrCreci?: string;
  shippingCep?: string;
  shippingStreet?: string;
  shippingNumber?: string;
  shippingComplement?: string;
  shippingDistrict?: string;
  shippingCity?: string;
  shippingState?: string;
  items: StoredOrderItem[];
  payment: StoredPayment | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customer: CustomerData;
  items: CartItem[];
}
