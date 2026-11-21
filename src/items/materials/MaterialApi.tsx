import type {
  MaterialRecord,
  MaterialCreateDTO,
  MaterialUpdateDTO,
} from "./MaterialTypes";
import {
  INVENTORY_ENDPOINTS,
  type ApiPage,
  type ApiResponse,
  type ListResponse,
} from "../../api";

export const materialKeys = {
  records: ["material", "records"] as const,
  detail: (id: string) => ["material", "detail", id] as const,
};

type MaterialListItem = {
  id: number;
  materialName: string;
  materialCode: string;
  createdDate?: string;
};

export type MaterialListParams = {
  keyword?: string;
  startDate?: string | null;
  endDate?: string | null;
  page?: number;
  pageSize?: number;
};

function toMaterialRecord(item: MaterialListItem): MaterialRecord {
  return {
    id: item.id,
    materialCode: item.materialCode,
    materialName: item.materialName,
    createdDate: item.createdDate ?? "",
  };
}

export async function fetchMaterialRecords(
  params?: MaterialListParams
): Promise<ListResponse<MaterialRecord[]>> {
  const qs = new URLSearchParams();

  if (params?.startDate) qs.set("startDate", params.startDate);
  if (params?.endDate) qs.set("endDate", params.endDate);
  if (params?.keyword) qs.set("keyword", params.keyword.trim());
  if (params?.page != null)
    qs.set("page", String(Math.max(0, params.page - 1)));
  if (params?.pageSize != null) qs.set("size", String(params.pageSize));

  const url = qs.toString()
    ? `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/getMaterialList?${qs.toString()}`
    : `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/getMaterialList`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Material 목록 요청 실패 (${res.status})`);

  const json: ApiResponse<ApiPage<MaterialListItem>> = await res.json();
  if (!json.success) throw new Error(json.message || "자재 목록 조회 실패");

  const page = json.data;
  const rows = page.content.map(toMaterialRecord);

  return {
    data: rows,
    meta: {
      total: page.totalElements,
      page: (page.page ?? 0) + 1,
      pageSize: page.size,
      totalPages: page.totalPages,
    },
  };
}

export async function fetchMaterialDetail(id: string): Promise<MaterialRecord> {
  const res = await fetch(`/api/materials/records/${id}`);
  if (!res.ok) throw new Error(`Material 상세 요청 실패 (${res.status})`);
  return res.json();
}

export async function createMaterial(
  payload: MaterialCreateDTO
): Promise<MaterialCreateDTO> {
  const url = `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/addMaterial`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([payload]),
  });
  if (!res.ok) throw new Error(`자재 생성 실패 (${res.status})`);
  return res.json();
}

export async function updateMaterial(
  id: string,
  patch: MaterialUpdateDTO
): Promise<MaterialRecord> {
  const res = await fetch(
    `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/updateMaterial/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }
  );
  if (!res.ok) throw new Error(`Material 수정 실패 (${res.status})`);
  return res.json();
}

export async function deleteMaterial(item: {
  materialId: number;
  materialName?: string;
  materialCode?: string;
}): Promise<{
  ok: boolean;
  removedId: string;
}> {
  const res = await fetch(
    `${INVENTORY_ENDPOINTS.MATERIALS_LIST}/deleteMaterial`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([item]),
    }
  );
  if (!res.ok) throw new Error(`Material 삭제 실패 (${res.status})`);
  return res.json();
}
