import { http, HttpResponse } from "msw";
import { WAREHOUSE_ENDPOINTS } from "../../../api";
import {
  categoryDetails,
  categoryRecords,
} from "../../../mocks/data/items.mock";

const BASE = WAREHOUSE_ENDPOINTS.PART_CATEGORIES;
const FALLBACK_BASES = [
  "/warehouse/api/v1/parts/categories",
  "/parts/categories",
  "/api/parts/categories",
] as const;

const respondList = () =>
  HttpResponse.json({
    status: 200,
    success: true,
    message: "ok",
    data: categoryRecords,
  });

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
  http.get(BASE, () => respondList()),
  http.get(`${BASE}/:id`, ({ params }) => respondDetail(String(params.id))),
  ...FALLBACK_BASES.map((path) =>
    http.get(path, () => respondList())
  ),
  ...FALLBACK_BASES.map((path) =>
    http.get(`${path}/:id`, ({ params }) => respondDetail(String(params.id)))
  ),
];
