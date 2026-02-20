import { http, HttpResponse } from "msw";
import {
  INVENTORY_BASE_PATH,
  WAREHOUSE_BASE_PATH,
  type ApiPage,
  type ApiResponse,
} from "../../api";
import type {
  ServerPartDetail,
  ServerPartListItem,
} from "../../items/parts/PartTypes";
import type { CategoryDetailRecord } from "../../items/categories/CategoryTypes";
import {
  categoryDetails,
  categoryRecords,
  materialRecords,
  partDetails,
  partListItems,
} from "../data/items.mock";
import {
  normalizeQueryString,
  parseDateValue,
  parseNumber,
  toApiResponse,
  toPaged,
} from "./utils";

const INVENTORY_BASE = INVENTORY_BASE_PATH;
const PARTS_BASE = `${WAREHOUSE_BASE_PATH}/parts`;

function filterParts(list: ServerPartListItem[], url: URL) {
  let rows = [...list];
  const q = normalizeQueryString(url, "q");
  const categoryId = normalizeQueryString(url, "categoryId");
  const categoryName = normalizeQueryString(url, "categoryName");
  const carModelId = normalizeQueryString(url, "carModelId");
  const carModelName = normalizeQueryString(url, "carModelName");
  const enabled = normalizeQueryString(url, "enabled");

  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter((item) =>
      `${item.name} ${item.code}`.toLowerCase().includes(lower)
    );
  }

  if (categoryId) {
    rows = rows.filter((item) => String(item.categoryId) === categoryId);
  }

  if (categoryName) {
    const lower = categoryName.toLowerCase();
    rows = rows.filter((item) =>
      (item.categoryName ?? "").toLowerCase().includes(lower)
    );
  }

  if (carModelId) {
    rows = rows.filter((item) =>
      item.carModelIds?.some((id) => String(id) === carModelId)
    );
  }

  if (carModelName) {
    const lower = carModelName.toLowerCase();
    rows = rows.filter((item) =>
      item.carModelNames?.some((name) => name.toLowerCase().includes(lower))
    );
  }

  if (enabled) {
    rows = rows.filter((item) => String(Boolean(item.enabled)) === enabled);
  }

  return rows;
}

export const itemsHandlers = [
  http.get(`${INVENTORY_BASE}/getMaterialList`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = normalizeQueryString(url, "keyword");
    const startDate = normalizeQueryString(url, "startDate");
    const endDate = normalizeQueryString(url, "endDate");
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    let rows = [...materialRecords];
    if (keyword) {
      const lower = keyword.toLowerCase();
      rows = rows.filter((item) =>
        `${item.materialName} ${item.materialCode}`
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
        const created = item.createdDate ? parseDateValue(item.createdDate) : null;
        if (!created) return false;
        const afterStart = start ? created >= start : true;
        const beforeEnd = end ? created <= end : true;
        return afterStart && beforeEnd;
      });
    }

    const pageData: ApiPage<typeof rows[number]> = toPaged(rows, page, size);
    const response: ApiResponse<ApiPage<typeof rows[number]>> =
      toApiResponse(pageData);
    return HttpResponse.json(response);
  }),

  http.get(`${PARTS_BASE}/integrated`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    const rows = filterParts(partListItems, url);

    const pageData = {
      items: rows.slice(page * size, page * size + size),
      page,
      size,
      total: rows.length,
    };

    const response: ApiResponse<typeof pageData> = toApiResponse(pageData);
    return HttpResponse.json(response);
  }),

  http.get(`${PARTS_BASE}/:id`, ({ params }) => {
    const id = String(params.id);
    const detail = partDetails.find((item) => String(item.id) === id);
    if (!detail) {
      return HttpResponse.json(
        { status: 404, success: false, message: "Not found", data: null },
        { status: 404 }
      );
    }
    const response: ApiResponse<ServerPartDetail> = toApiResponse(detail);
    return HttpResponse.json(response);
  }),

  http.get(`${PARTS_BASE}/categories`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = normalizeQueryString(url, "keyword");
    const startDate = normalizeQueryString(url, "startDate");
    const endDate = normalizeQueryString(url, "endDate");

    let rows = [...categoryRecords];

    if (keyword) {
      const lower = keyword.toLowerCase();
      rows = rows.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          (item.description ?? "").toLowerCase().includes(lower)
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
        const detail = categoryDetails.find((d) => String(d.id) === String(item.id));
        const basis = parseDateValue(detail?.updatedAt ?? detail?.createdAt ?? null);
        if (!basis) return false;
        const afterStart = start ? basis >= start : true;
        const beforeEnd = end ? basis <= end : true;
        return afterStart && beforeEnd;
      });
    }

    const response: ApiResponse<typeof categoryRecords> =
      toApiResponse(rows);
    return HttpResponse.json(response);
  }),

  http.get(`${PARTS_BASE}/categories/:id`, ({ params }) => {
    const id = String(params.id);
    const detail = categoryDetails.find((item) => String(item.id) === id);
    if (!detail) {
      return HttpResponse.json(
        { status: 404, success: false, message: "Not found", data: null },
        { status: 404 }
      );
    }
    const response: ApiResponse<CategoryDetailRecord> = toApiResponse(detail);
    return HttpResponse.json(response);
  }),
];
