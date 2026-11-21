export type OutboundStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELAYED";

export type OutboundPartStatus = "PENDING" | "READY" | "COMPLETED" | "SHORTAGE";

export const OUTBOUND_STATUS_LABELS: Record<OutboundStatus, string> = {
  PENDING: "대기",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  DELAYED: "지연",
};

export const OUTBOUND_STATUS_VARIANTS: Record<
  OutboundStatus,
  "info" | "warning" | "success" | "rejected"
> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  DELAYED: "rejected",
};

export const OUTBOUND_PART_STATUS_LABELS: Record<OutboundPartStatus, string> = {
  PENDING: "대기",
  READY: "출고 준비",
  SHORTAGE: "재고 부족",
  COMPLETED: "완료",
};

export const OUTBOUND_PART_STATUS_VARIANTS: Record<
  OutboundPartStatus,
  "info" | "warning" | "success" | "rejected"
> = {
  PENDING: "warning",
  READY: "info",
  SHORTAGE: "rejected",
  COMPLETED: "success",
};

export interface OutboundPartItem {
  lineId: number;
  product: {
    id: number;
    lot: string;
    code: string;
    name: string;
    imgUrl: string;
  };
  orderedQty: number;
  pickedQty: number;
  status: OutboundPartStatus | string;
}

export interface OutboundRecord {
  noteId: number;
  shippingNo: string;
  shippedAt?: string;
  requestedAt: string;
  expectedShipDate?: string;
  branchName: string;
  totalQty: number;
  assigneeName?: string;
  assigneeDept?: string;
  assigneePhone?: string;
  status: OutboundStatus;
  warehouseCode: string;
  remark?: string;
  completedAt: string | null;
  itemKindsNumber: number;
  lines?: OutboundPartItem[];
}
