export type CertificateCategory = 
  | 'registro-civil'
  | 'notas'
  | 'imoveis'
  | 'protesto'
  | 'distribuidores-judiciais'
  | 'pessoa-juridica'
  | 'rural';

export type CertificateFormat = 'DIGITAL_ECERTIDAO' | 'PHYSICAL_PAPER' | 'BOTH';

export type CertificatePriceMode = "national" | "uf-format" | "uf-flat";

export interface FormFieldVisibility {
  field: string;
  in?: string[];
  notIn?: string[];
}

export interface FormFieldOption {
  label: string;
  value: string;
  price?: number;
  priceByUf?: Record<string, number>;
}

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'textarea' | 'checkbox';
  placeholder?: string;
  helperText?: string;
  required: boolean;
  options?: FormFieldOption[];
  visibleWhen?: FormFieldVisibility | FormFieldVisibility[];
  dataSource?: "ibge-uf" | "ibge-city";
  price?: number;
  priceByUf?: Record<string, number>;
}

export interface CertificateTypeConfig {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: CertificateCategory;
  categoryName: string;
  basePrice: number;
  estimatedDays: string;
  requiresCartorio: boolean;
  hasSearchFee: boolean;
  searchFee: number;
  hasApostilleOption: boolean;
  apostillePrice: number;
  hasShippingOption: boolean;
  shippingPrice: number;
  priceMode?: CertificatePriceMode;
  fields: FormFieldDefinition[];
  ufFormatPrices?: Record<
    string,
    { ELECTRONIC: number | null; PAPER: number | null; BOTH: number | null }
  >;
  ufFlatPrices?: Record<string, number>;
  ufApostillePrices?: Record<string, number>;
}

export interface CartItem {
  id: string; // Temporary UUID for cart
  certificateTypeSlug: string;
  certificateName: string;
  category: CertificateCategory;
  categoryName: string;
  
  // Location
  state: string;
  stateName: string;
  city: string;
  cartorioId?: string;
  cartorioName?: string;
  isUnknownCartorio: boolean;
  
  // Dynamic Document Data filled by user
  documentData: Record<string, any>;
  
  // Modality & Options
  format: CertificateFormat;
  hasApostille: boolean;
  hasShipping: boolean;
  
  // Pricing
  basePrice: number;
  searchFee: number;
  apostillePrice: number;
  extrasPrice?: number;
  shippingPrice: number;
  itemTotal: number;
  
  // B2B Tag / Internal Ref
  referenceTag?: string; // e.g., "Processo 00123/2026 - Imóvel Jardins"
}

export interface MultiItemCart {
  items: CartItem[];
  itemsSubtotal: number;
  shippingSubtotal: number;
  total: number;
}

export interface CustomerData {
  fullName: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  isCompany: boolean;
  companyName?: string;
  oabOrCreci?: string;
  
  // Shipping address (if any physical items)
  shipping?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
  };
}

export interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export interface IBGECity {
  id: number;
  nome: string;
}

export interface CartorioInfo {
  id: string;
  cns: string;
  name: string;
  attribution: string;
  state: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
}
