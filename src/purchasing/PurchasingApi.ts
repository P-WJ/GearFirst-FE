import { INVENTORY_BASE_PATH, type ApiPage } from "../api";
import type {
  CompanyRecord,
  MaterialItem,
  PurchasingRecord,
} from "./PurchasingTypes";

const BASE_URL = INVENTORY_BASE_PATH;

type QueryListMeta = {
  total: number;
  page: number;
  size: number;
  totalPages: number;
};

type CompanyListItem = {
  registNum: number;
  materialName: string;
  materialCode: string;
  companyName: string;
  price: number;
  quantity: number;
  spendDay: number;
  surveyDate: string;
  untilDate: string;
  orderCnt: number;
  createdAt: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type CompanyListData = {
  content?: CompanyListItem[];
  totalElements?: number;
  page?: number;
  size?: number;
  totalPages?: number;
};

type CompanyPayload = { id: number; orderCnt: number; totalPrice: number };

type CompanyMutationResponse = ApiEnvelope<Record<string, unknown>>;

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(
      `구매 API 호출 실패 (${res.status} ${res.statusText || ""})`.trim(),
    );
  }

  return res.json() as Promise<T>;
}

export const purchasingKeys = {
  records: ["purchasing", "records"] as const,
};

export async function addCompany(data: {
  materialId?: number;
  materialCode: string;
  materialName: string;
  price: number | string;
  companyName: string;
  quantity: number | string;
  spentDay: number | string;
  surveyDate: string;
  untilDate: string;
}): Promise<CompanyMutationResponse> {
  return requestJson<CompanyMutationResponse>("/addCompany", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchMaterialList(query: string, page = 0, size = 10) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: "createdAt",
  });

  const keyword = query.trim();
  if (keyword) {
    params.set("keyword", keyword);
  }

  const json = await requestJson<ApiEnvelope<ApiPage<MaterialItem>>>(
    `/getMaterialList?${params.toString()}`,
  );

  return json.data?.content ?? [];
}

export async function fetchCompanyList(params?: {
  keyword?: string;
  isSelected?: boolean;
  page?: number;
  size?: number;
}): Promise<{ data: PurchasingRecord[]; meta: QueryListMeta }> {
  const query = new URLSearchParams();

  if (params?.keyword) query.append("keyword", params.keyword);
  if (params?.isSelected !== undefined) {
    query.append("isSelected", params.isSelected ? "true" : "false");
  }

  query.append("page", String(params?.page ?? 0));
  query.append("size", String(params?.size ?? 10));
  query.append("sort", "createdAt");

  const json = await requestJson<ApiEnvelope<CompanyListData>>(
    `/getCompanyList?${query.toString()}`,
  );

  if (!json.success) {
    throw new Error(json.message || "조회 실패");
  }

  const data = json.data ?? {};
  const content = data.content ?? [];

  const records: PurchasingRecord[] = content.map((item) => ({
    purchasingId: String(item.registNum),
    materialName: item.materialName,
    materialCode: item.materialCode,
    company: item.companyName,
    purchasingPrice: item.price,
    requiredQuantityPerPeriod: item.quantity,
    requiredPeriodInDays: item.spendDay,
    surveyDate: item.surveyDate,
    expiryDate: item.untilDate,
    status: "등록",
    orderCnt: item.orderCnt,
    createdAt: item.createdAt,
  }));

  return {
    data: records,
    meta: {
      total: data.totalElements ?? 0,
      page: data.page ?? 0,
      size: data.size ?? 10,
      totalPages: data.totalPages ?? 1,
    },
  };
}

export async function fetchCompanyCandidates(params: {
  endDate: string;
  keyword: string;
}): Promise<CompanyRecord[]> {
  const query = new URLSearchParams({
    endDate: params.endDate,
    keyword: params.keyword,
    page: "0",
    size: "10",
    sort: "createdAt",
  });

  const json = await requestJson<ApiEnvelope<CompanyListData>>(
    `/getCompanyList?${query.toString()}`,
  );

  if (!json.success) throw new Error(json.message || "조회 실패");

  const content = json.data?.content ?? [];
  return content.map((item) => ({
    companyId: item.registNum,
    registNum: String(item.registNum),
    companyName: item.companyName,
    materialCode: item.materialCode,
    materialName: item.materialName,
    price: item.price,
    quantity: item.quantity,
    surveyDate: item.surveyDate,
    untilDate: item.untilDate,
    orderCnt: item.orderCnt,
    requiredQuantityPerPeriod: item.quantity,
    requiredPeriodInDays: item.spendDay,
  }));
}

export async function createPurchaseOrders(payload: CompanyPayload[]) {
  return requestJson<CompanyMutationResponse>("/selectCompany", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
