import { http, HttpResponse } from "msw";
import { INVENTORY_BASE_PATH, type ApiResponse, type ApiPage } from "../../api";
import { bomItems, bomMaterialsById } from "../data/bom.mock";
import type { ServerBOMItem, ServerBOMMaterialItem } from "../../bom/BOMTypes";
import { normalizeQueryString, parseNumber, toApiResponse, toPaged } from "./utils";

const BASE = INVENTORY_BASE_PATH;

export const bomHandlers = [
  http.get(`${BASE}/getBomList`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = normalizeQueryString(url, "keyword");
    const category = normalizeQueryString(url, "category");
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    let rows = [...bomItems];

    if (category && category !== "ALL") {
      rows = rows.filter((item) => item.category === category);
    }

    if (keyword) {
      const lower = keyword.toLowerCase();
      rows = rows.filter((item) =>
        `${item.bomCode} ${item.partName} ${item.partCode}`
          .toLowerCase()
          .includes(lower)
      );
    }

    const pageData: ApiPage<ServerBOMItem> = toPaged(rows, page, size);
    const response: ApiResponse<ApiPage<ServerBOMItem>> = toApiResponse(pageData);
    return HttpResponse.json(response);
  }),

  http.get(`${BASE}/getMaterialList/:bomCodeId`, ({ params }) => {
    const id = Number(params.bomCodeId);
    const materials = bomMaterialsById.get(id) ?? [];
    const response: ApiResponse<ServerBOMMaterialItem[]> = toApiResponse(materials);
    return HttpResponse.json(response);
  }),
];
