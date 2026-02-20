import { http, HttpResponse } from "msw";
import { INVENTORY_BASE_PATH, type ApiResponse, type ApiPage } from "../../api";
import { bomItems, bomMaterialsById } from "../data/bom.mock";
import type { ServerBOMItem, ServerBOMMaterialItem } from "../../bom/BOMTypes";
import {
  normalizeQueryString,
  parseDateValue,
  parseNumber,
  toApiResponse,
  toPaged,
} from "./utils";

const BASE = INVENTORY_BASE_PATH;

export const bomHandlers = [
  http.get(`${BASE}/getBomList`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = normalizeQueryString(url, "keyword");
    const category = normalizeQueryString(url, "category");
    const startDate = normalizeQueryString(url, "startDate");
    const endDate = normalizeQueryString(url, "endDate");
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

    let start = parseDateValue(startDate);
    let end = parseDateValue(endDate);
    if (start && end && start > end) {
      const tmp = start;
      start = end;
      end = tmp;
    }

    if (start || end) {
      rows = rows.filter((item) => {
        const created = parseDateValue(item.createdAt);
        if (!created) return false;
        const afterStart = start ? created >= start : true;
        const beforeEnd = end ? created <= end : true;
        return afterStart && beforeEnd;
      });
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
