export type InboundStatus = "done" | "not-done" | "all";

export type InboundUIStatus = "합격" | "불합격" | "보류";

export type InboundDetailStatusRaw =
  | "IN_PROGRESS"
  | "COMPLETED_OK"
  | "COMPLETED_ISSUE"
  | "PENDING"
  | (string & {});

export const InboundStatusLabelMap: Record<string, string> = {
  PENDING: "대기",
  IN_PROGRESS: "진행중",
  COMPLETED_OK: "완료",
  COMPLETED_ISSUE: "재입고 대기",
};

export type InboundLineStatusRaw =
  | "ACCEPTED"
  | "REJECTED"
  | "PENDING"
  | (string & {});

export type InboundLineStatus = "accepted" | "rejected" | "pending";

export interface InboundRecord {
  noteId: number;
  receivingNo: string;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;
  status: InboundStatus;
  statusRaw?: string;
  completedAt: string | null;
  requestedAt: string | null;
  expectedReceiveDate?: string | null;
  warehouseCode: string;
}

export interface InboundDetailProduct {
  id: number;
  lot: string;
  code: string;
  name: string;
  imgUrl?: string | null;
}

export interface InboundDetailLine {
  lineId: string;
  product: InboundDetailProduct;
  orderedQty: number;
  inspectedQty: number;
  status: InboundLineStatus;
}

export interface InboundDetailRecord {
  receivingNo: string;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;

  status: InboundDetailStatusRaw;

  completedAt?: string | null;
  requestedAt: string;
  expectedReceiveDate?: string | null;
  receivedAt?: string | null;
  warehouseCode?: string | null;

  inspectorName?: string | null;
  inspectorDept?: string | null;
  inspectorPhone?: string | null;
  remark?: string;

  lines: InboundDetailLine[];
}

export function normalizeNoteStatus(raw?: string) {
  return (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function mapNoteStatusToGroup(raw?: string): InboundStatus {
  const u = normalizeNoteStatus(raw);
  if (u === "completed-ok" || u === "completed-issue") return "done";
  if (u === "pending" || u === "in-progress") return "not-done";
  return "not-done";
}

export function labelForGroupStatus(s: InboundStatus) {
  if (s === "done") return "입고완료";
  if (s === "not-done") return "입고예정";
  return "전체";
}

export function mapDetailLineStatus(
  raw?: InboundLineStatusRaw
): InboundLineStatus {
  const u = (raw ?? "").trim().toUpperCase();
  if (u === "ACCEPTED") return "accepted";
  if (u === "REJECTED") return "rejected";
  return "pending";
}

export function labelForLineStatus(s: InboundLineStatus) {
  return s === "accepted" ? "합격" : s === "rejected" ? "불합격" : "보류";
}
export function mapDetailHeaderStatus(
  raw?: InboundDetailStatusRaw
): InboundUIStatus {
  const u = (raw ?? "").trim().toUpperCase();

  if (u === "COMPLETED_OK") return "합격";
  if (u === "COMPLETED_ISSUE") return "보류";
  if (u === "PENDING" || u === "IN_PROGRESS") return "보류";

  if (u.includes("REJECT") || u.includes("FAIL") || u.includes("NG"))
    return "불합격";

  return "보류";
}

export const inboundStatusLabelMap: Record<string, string> = {
  PENDING: "입고요청",
  IN_PROGRESS: "입고진행중",
  COMPLETED_OK: "입고완료",
  COMPLETED_ISSUE: "재입고대기(불량)",

  DEFAULT: "기타",
};

export const inboundStatusVariantMap: Record<
  string,
  "pending" | "accepted" | "rejected"
> = {
  PENDING: "pending",
  IN_PROGRESS: "pending",
  COMPLETED_OK: "accepted",
  COMPLETED_ISSUE: "rejected",
  DEFAULT: "pending",
};

export function getInboundStatusVariant(
  status?: string
): "pending" | "accepted" | "rejected" {
  const key = (status ?? "").trim().toUpperCase();
  return inboundStatusVariantMap[key] || inboundStatusVariantMap.DEFAULT;
}
