import { http, HttpResponse } from "msw";
import { WAREHOUSE_BASE_PATH, type ApiResponse } from "../../api";
import { mapNoteStatusToGroup } from "../../inbound/InboundTypes";
import {
  inboundDetailsById,
  inboundListItems,
  type ServerInboundDetail,
  type ServerInboundListItem,
} from "../data/inbound.mock";
import {
  parseNumber,
  normalizeQueryString,
  toApiResponse,
  parseDateValue,
} from "./utils";

const BASE = `${WAREHOUSE_BASE_PATH}/receiving`;

function filterInbound(
  items: ServerInboundListItem[],
  status: string,
  q: string,
  dateFrom?: string,
  dateTo?: string,
  warehouseCode?: string
) {
  let rows = [...items];

  if (status && status !== "all") {
    rows = rows.filter((item) => mapNoteStatusToGroup(item.status) === status);
  }

  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter((item) =>
      `${item.receivingNo} ${item.supplierName} ${item.warehouseCode}`
        .toLowerCase()
        .includes(lower)
    );
  }

  if (warehouseCode) {
    rows = rows.filter((item) => item.warehouseCode === warehouseCode);
  }

  if (dateFrom || dateTo) {
    const from = dateFrom ? parseDateValue(dateFrom) : null;
    const to = dateTo ? parseDateValue(dateTo) : null;
    rows = rows.filter((item) => {
      const baseDate = item.requestedAt ?? item.completedAt ?? "";
      if (!baseDate) return false;
      const d = parseDateValue(baseDate);
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  return rows;
}

export const inboundHandlers = [
  http.get(`${BASE}/notes`, ({ request }) => {
    const url = new URL(request.url);
    const status = normalizeQueryString(url, "status") || "all";
    const q = normalizeQueryString(url, "q");
    const dateFrom = normalizeQueryString(url, "dateFrom") || undefined;
    const dateTo = normalizeQueryString(url, "dateTo") || undefined;
    const warehouseCode = normalizeQueryString(url, "warehouseCode") || undefined;

    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    const filtered = filterInbound(
      inboundListItems,
      status,
      q,
      dateFrom,
      dateTo,
      warehouseCode
    );

    const start = page * size;
    const paged = filtered.slice(start, start + size);

    const payload = {
      items: paged,
      page,
      size,
      total: filtered.length,
    };

    const response: ApiResponse<typeof payload> = toApiResponse(payload);
    return HttpResponse.json(response);
  }),

  http.get(`${BASE}/:noteId`, ({ params }) => {
    const id = Number(params.noteId);
    const detail = inboundDetailsById.get(id);

    if (!detail) {
      return HttpResponse.json(
        { status: 404, success: false, message: "Not found", data: null },
        { status: 404 }
      );
    }

    const response: ApiResponse<ServerInboundDetail> = toApiResponse(detail);
    return HttpResponse.json(response);
  }),
];
