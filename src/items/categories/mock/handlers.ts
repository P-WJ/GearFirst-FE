import { http, HttpResponse } from "msw";
import { WAREHOUSE_ENDPOINTS } from "../../../api";
import {
  categoryDetails,
  categoryRecords,
} from "../../../mocks/data/items.mock";
import { parseDateValue } from "../../../mocks/handlers/utils";

const BASE = WAREHOUSE_ENDPOINTS.PART_CATEGORIES;
const FALLBACK_BASES = [
  "/warehouse/api/v1/parts/categories",
  "/parts/categories",
  "/api/parts/categories",
] as const;

const respondList = (request: Request) => {
  const url = new URL(request.url);
  const keyword = (url.searchParams.get("keyword") ?? "").trim().toLowerCase();
  const startDateRaw = (url.searchParams.get("startDate") ?? "").trim();
  const endDateRaw = (url.searchParams.get("endDate") ?? "").trim();

  let rows = [...categoryRecords];

  if (keyword) {
    rows = rows.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        (item.description ?? "").toLowerCase().includes(keyword)
    );
  }

  let startDate = parseDateValue(startDateRaw);
  let endDate = parseDateValue(endDateRaw);
  if (startDate && endDate && startDate > endDate) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }

  if (startDate || endDate) {
    rows = rows.filter((item) => {
      const detail = categoryDetails.find((d) => String(d.id) === String(item.id));
      const basis = parseDateValue(detail?.updatedAt ?? detail?.createdAt ?? null);
      if (!basis) return false;
      const afterStart = startDate ? basis >= startDate : true;
      const beforeEnd = endDate ? basis <= endDate : true;
      return afterStart && beforeEnd;
    });
  }

  return HttpResponse.json({
    status: 200,
    success: true,
    message: "ok",
    data: rows,
  });
};

const respondDetail = (id: string) => {
  const detail = categoryDetails.find((item) => String(item.id) === id);
  if (!detail) {
    return HttpResponse.json(
      { status: 404, success: false, message: "Not found", data: null },
      { status: 404 }
    );
  }
  return HttpResponse.json({
    status: 200,
    success: true,
    message: "ok",
    data: detail,
  });
};

export const categoryHandlers = [
  http.get(BASE, ({ request }) => respondList(request)),
  http.get(`${BASE}/:id`, ({ params }) => respondDetail(String(params.id))),
  ...FALLBACK_BASES.map((path) =>
    http.get(path, ({ request }) => respondList(request))
  ),
  ...FALLBACK_BASES.map((path) =>
    http.get(`${path}/:id`, ({ params }) => respondDetail(String(params.id)))
  ),
];
