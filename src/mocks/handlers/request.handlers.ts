import { http, HttpResponse } from "msw";
import { ORDER_BASE_PATH } from "../../api";
import type {
  CancelOrderResponse,
  PendingOrderResponse,
  ProcessedOrderResponse,
} from "../../request/RequestTypes";
import {
  cancelOrders,
  orderDetailsById,
  pendingOrders,
  processedOrders,
} from "../data/request.mock";
import { parseNumber } from "./utils";

const BASE = `${ORDER_BASE_PATH}/purchase-orders/head`;

function paginate<T>(items: T[], page: number, size: number) {
  const start = page * size;
  return items.slice(start, start + size);
}

export const requestHandlers = [
  http.get(`${BASE}/orders/pending`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    const content = paginate(pendingOrders, page, size);
    const payload: PendingOrderResponse = {
      status: 200,
      success: true,
      message: "ok",
      data: {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements: pendingOrders.length,
        totalPages: Math.max(1, Math.ceil(pendingOrders.length / size)),
        last: page + 1 >= Math.ceil(pendingOrders.length / size),
      },
    };

    return HttpResponse.json(payload);
  }),

  http.get(`${BASE}/orders/processed`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    const content = paginate(processedOrders, page, size);
    const payload: ProcessedOrderResponse = {
      status: 200,
      success: true,
      message: "ok",
      data: {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements: processedOrders.length,
        totalPages: Math.max(1, Math.ceil(processedOrders.length / size)),
        last: page + 1 >= Math.ceil(processedOrders.length / size),
      },
    };

    return HttpResponse.json(payload);
  }),

  http.get(`${BASE}/orders/cancel`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    const content = paginate(cancelOrders, page, size);
    const payload: CancelOrderResponse = {
      status: 200,
      success: true,
      message: "ok",
      data: {
        content,
        pageNumber: page,
        pageSize: size,
        totalElements: cancelOrders.length,
        totalPages: Math.max(1, Math.ceil(cancelOrders.length / size)),
        last: page + 1 >= Math.ceil(cancelOrders.length / size),
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
