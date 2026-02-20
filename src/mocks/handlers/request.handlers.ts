import { http, HttpResponse } from "msw";
import { ORDER_BASE_PATH } from "../../api";
import type {
  CancelOrderItem,
  CancelOrderResponse,
  PendingOrderItem,
  PendingOrderResponse,
  ProcessedOrderItem,
  ProcessedOrderResponse,
} from "../../request/RequestTypes";
import {
  cancelOrders,
  orderDetailsById,
  pendingOrders,
  processedOrders,
} from "../data/request.mock";
import { normalizeQueryString, parseDateValue, parseNumber } from "./utils";

const BASE = `${ORDER_BASE_PATH}/purchase-orders/head`;

function paginate<T>(items: T[], page: number, size: number) {
  const start = page * size;
  return items.slice(start, start + size);
}

type RequestOrderLike = {
  orderNumber: string;
  branchCode: string;
  engineerName: string;
  engineerRole: string;
  orderStatus: string;
  requestDate: string;
};

function filterRequestOrders<T extends RequestOrderLike>(rows: T[], url: URL): T[] {
  const search = normalizeQueryString(url, "search").toLowerCase();
  const status = normalizeQueryString(url, "status");
  const startDateRaw = normalizeQueryString(url, "startDate");
  const endDateRaw = normalizeQueryString(url, "endDate");

  let startDate = parseDateValue(startDateRaw);
  let endDate = parseDateValue(endDateRaw);

  if (startDate && endDate && startDate > endDate) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }

  return rows.filter((item) => {
    if (search) {
      const target =
        `${item.orderNumber} ${item.branchCode} ${item.engineerName} ${item.engineerRole}`.toLowerCase();
      if (!target.includes(search)) return false;
    }

    if (status && status !== "ALL" && item.orderStatus !== status) {
      return false;
    }

    if (startDate || endDate) {
      const requestDate = parseDateValue(item.requestDate);
      if (!requestDate) return false;
      if (startDate && requestDate < startDate) return false;
      if (endDate && requestDate > endDate) return false;
    }

    return true;
  });
}

export const requestHandlers = [
  http.get(`${BASE}/orders/pending`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);
    const filtered = filterRequestOrders<PendingOrderItem>(pendingOrders, url);

    const content = paginate(filtered, page, size);
    const payload: PendingOrderResponse = {
      status: 200,
      success: true,
      message: "ok",
      data: {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
        last: page + 1 >= Math.ceil(filtered.length / size),
      },
    };

    return HttpResponse.json(payload);
  }),

  http.get(`${BASE}/orders/processed`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);
    const filtered = filterRequestOrders<ProcessedOrderItem>(processedOrders, url);

    const content = paginate(filtered, page, size);
    const payload: ProcessedOrderResponse = {
      status: 200,
      success: true,
      message: "ok",
      data: {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
        last: page + 1 >= Math.ceil(filtered.length / size),
      },
    };

    return HttpResponse.json(payload);
  }),

  http.get(`${BASE}/orders/cancel`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);
    const filtered = filterRequestOrders<CancelOrderItem>(cancelOrders, url);

    const content = paginate(filtered, page, size);
    const payload: CancelOrderResponse = {
      status: 200,
      success: true,
      message: "ok",
      data: {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
        last: page + 1 >= Math.ceil(filtered.length / size),
      },
    };

    return HttpResponse.json(payload);
  }),

  http.get(`${BASE}/:orderId`, ({ params }) => {
    const id = Number(params.orderId);
    const detail = orderDetailsById.get(id);
    if (!detail) {
      return HttpResponse.json(
        { status: 404, success: false, message: "Not found", data: null },
        { status: 404 }
      );
    }
    return HttpResponse.json(detail);
  }),
];
