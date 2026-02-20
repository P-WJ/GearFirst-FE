import { http, HttpResponse } from "msw";
import {
  WAREHOUSE_BASE_PATH,
  type ApiResponse,
  type ApiPage,
} from "../../api";
import type {
  ServerCarModel,
  ServerCarModelPart,
  ServerPartCarModel,
} from "../../carModel/CarModelTypes";
import {
  carModels,
  carModelPartsByCarModelId,
  partCarModelsByPartId,
} from "../data/vehicle.mock";
import { normalizeQueryString, parseNumber, toApiResponse, toPaged } from "./utils";

const CAR_MODELS_BASE = `${WAREHOUSE_BASE_PATH}/car-models`;
const PARTS_BASE = `${WAREHOUSE_BASE_PATH}/parts`;

export const vehicleHandlers = [
  http.get(`${CAR_MODELS_BASE}`, ({ request }) => {
    const url = new URL(request.url);
    const q = normalizeQueryString(url, "q");
    const enabled = normalizeQueryString(url, "enabled");
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 10);

    let rows = [...carModels];
    if (q) {
      const lower = q.toLowerCase();
      rows = rows.filter((item) => (item.name ?? "").toLowerCase().includes(lower));
    }
    if (enabled) {
      rows = rows.filter((item) => String(Boolean(item.enabled)) === enabled);
    }

    const pageData: ApiPage<ServerCarModel> = toPaged(rows, page, size);
    const response: ApiResponse<ApiPage<ServerCarModel>> = toApiResponse(pageData);
    return HttpResponse.json(response);
  }),

  http.get(`${PARTS_BASE}/:partId/car-models`, ({ params, request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 10);
    const partId = Number(params.partId);
    const items = partCarModelsByPartId.get(partId) ?? [];

    const pageData: ApiPage<ServerPartCarModel> = toPaged(items, page, size);
    const response: ApiResponse<ApiPage<ServerPartCarModel>> = toApiResponse(pageData);
    return HttpResponse.json(response);
  }),

  http.get(`${CAR_MODELS_BASE}/:carModelId/parts`, ({ params, request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 10);
    const name = normalizeQueryString(url, "name");
    const code = normalizeQueryString(url, "code");
    const categoryId = normalizeQueryString(url, "categoryId");
    const carModelId = Number(params.carModelId);

    let items = carModelPartsByCarModelId.get(carModelId) ?? [];

    if (name) {
      const lower = name.toLowerCase();
      items = items.filter((item) => (item.name ?? "").toLowerCase().includes(lower));
    }
    if (code) {
      const lower = code.toLowerCase();
      items = items.filter((item) => (item.code ?? "").toLowerCase().includes(lower));
    }
    if (categoryId) {
      items = items.filter((item) => String(item.category?.id ?? "") === categoryId);
    }

    const pageData: ApiPage<ServerCarModelPart> = toPaged(items, page, size);
    const response: ApiResponse<ApiPage<ServerCarModelPart>> = toApiResponse(pageData);
    return HttpResponse.json(response);
  }),
];
