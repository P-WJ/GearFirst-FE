import { http, HttpResponse } from "msw";
import { WAREHOUSE_BASE_PATH, type ApiResponse } from "../../api";
import { outboundRecords } from "../data/outbound.mock";
import {
  normalizeQueryString,
  parseDateValue,
  parseNumber,
  toApiResponse,
} from "./utils";

const BASE = `${WAREHOUSE_BASE_PATH}/shipping`;

export const outboundHandlers = [
  http.get(`${BASE}/notes`, ({ request }) => {
    const url = new URL(request.url);
    const status = normalizeQueryString(url, "status") || "all";
    const q = normalizeQueryString(url, "q");
    const warehouseCode = normalizeQueryString(url, "warehouseCode");
    const dateFrom = normalizeQueryString(url, "dateFrom");
    const dateTo = normalizeQueryString(url, "dateTo");
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    let rows = [...outboundRecords];

    if (status && status !== "all") {
      rows = rows.filter((item) =>
        status === "not-done"
          ? item.status !== "COMPLETED" && item.status !== "DELAYED"
          : status === "done"
          ? item.status === "COMPLETED" || item.status === "DELAYED"
          : status === "completed"
          ? item.status === "COMPLETED"
          : status === "delayed"
          ? item.status === "DELAYED"
          : true
      );
    }

    if (q) {
      const lower = q.toLowerCase();
      rows = rows.filter((item) =>
        `${item.shippingNo} ${item.branchName} ${item.warehouseCode}`
          .toLowerCase()
          .includes(lower)
      );
    }

    if (warehouseCode) {
      rows = rows.filter((item) => item.warehouseCode === warehouseCode);
    }

    let from = parseDateValue(dateFrom);
    let to = parseDateValue(dateTo);
    if (from && to && from > to) {
      const tmp = from;
      from = to;
      to = tmp;
    }

    if (from || to) {
      rows = rows.filter((item) => {
        const basis =
          status === "done" || status === "completed" || status === "delayed"
            ? parseDateValue(item.shippedAt ?? item.completedAt ?? item.requestedAt)
            : parseDateValue(item.expectedShipDate ?? item.requestedAt);
        if (!basis) return false;
        const afterFrom = from ? basis >= from : true;
        const beforeTo = to ? basis <= to : true;
        return afterFrom && beforeTo;
      });
    }

    const payload = {
      items: rows.slice(page * size, page * size + size),
      total: rows.length,
      page,
      size,
    };

    const response: ApiResponse<typeof payload> = toApiResponse(payload);
    return HttpResponse.json(response);
  }),

  http.get(`${BASE}/:noteId`, ({ params }) => {
    const noteId = Number(params.noteId);
    const record = outboundRecords.find((item) => item.noteId === noteId);
    if (!record) {
      return HttpResponse.json(
        { status: 404, success: false, message: "Not found", data: null },
        { status: 404 }
      );
    }
    const response: ApiResponse<typeof record> = toApiResponse(record);
    return HttpResponse.json(response);
  }),
];
