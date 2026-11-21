export type PartStatus = "여유" | "적정" | "부족";

export interface PartRecord {
  warehouseCode: string;
  part: PartItem;
  onHandQty: number;
  updatedAt: string;
  lastUpdatedAt?: string;
  lowStock: boolean;
  safetyStockQty: number;
  supplierName: string;
}

export interface PartItem {
  id: number;
  code: string;
  name: string;
}

export interface PartResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    items: PartRecord[];
    page: number;
    size: number;
    total: number;
  };
}
