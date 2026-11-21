export type PurchasingStatus = "등록" | "선정";

export interface PurchasingRecord {
  purchasingId: string;
  materialId?: number;
  materialCode?: string;
  materialName: string;
  purchasingDate?: string;
  company: string;
  purchasingPrice: number;
  surveyDate: string;
  expiryDate: string;
  status: PurchasingStatus;
  requiredQuantityPerPeriod: number;
  requiredPeriodInDays: number;
  orderCnt?: number;
  createdAt?: string;
}

export interface CompanyRecord {
  companyId: number;
  registNum: string;
  companyName: string;
  materialCode: string;
  materialName: string;
  price: number;
  quantity: number;
  surveyDate: string;
  untilDate: string;
  orderCnt: number;
  requiredQuantityPerPeriod: number;
  requiredPeriodInDays: number;
}

export interface PurchasingFilters {
  status?: PurchasingStatus | "ALL";
  company?: string;
}

export interface MaterialRequirement {
  materialCode: string;
  materialName: string;
  required: number;
  needDate: string;
}

export interface VendorQuote {
  materialCode: string;
  materialName: string;
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  requiredPeriodInDays: number;
  requiredQuantityPerPeriod: number;
  expiryDate: string;
}

export interface BasketLine {
  materialCode: string;
  materialName: string;
  vendorId: string;
  vendorName: string;
  orderQty: number;
  unitPrice: number;
  leadTimeDays: number;
  eta: string;
}

export interface MaterialItem {
  id: number;
  materialCode: string;
  materialName: string;
}
