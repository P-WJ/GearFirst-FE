import { http, HttpResponse } from "msw";
import { WAREHOUSE_BASE_PATH } from "../../api";
import type { PropertyResponse } from "../../property/PropertyTypes";
import { inventoryOnHandRecords } from "../data/inventory.mock";
import { normalizeQueryString, parseNumber } from "./utils";

const BASE = `${WAREHOUSE_BASE_PATH}/inventory/on-hand`;

export const propertyHandlers = [
  http.get(BASE, ({ request }) => {
    const url = new URL(request.url);
    const q = normalizeQueryString(url, "q");
    const warehouseCode = normalizeQueryString(url, "warehouseCode");
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 20);

    let rows = [...inventoryOnHandRecords];

    if (q) {
      const lower = q.toLowerCase();
      rows = rows.filter((item) =>
        `${item.partCode} ${item.partName} ${item.supplierName}`
          .toLowerCase()
          .includes(lower)
      );
    }

    if (warehouseCode) {
      rows = rows.filter((item) => item.warehouseCode === warehouseCode);
    }

    const payload: PropertyResponse = {
      status: 200,
      success: true,
      message: "ok",
      data: {
        items: rows.slice(page * size, page * size + size),
        page,
        size,
        total: rows.length,
      },
    };

    return HttpResponse.json(payload);
  }),
];
