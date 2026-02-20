import { http, HttpResponse } from "msw";
import { INVENTORY_BASE_PATH, type ApiResponse } from "../../api";
import { companyListItems } from "../data/purchasing.mock";
import { normalizeQueryString, parseNumber, toApiResponse } from "./utils";

const BASE = INVENTORY_BASE_PATH;

export const purchasingHandlers = [
  http.get(`${BASE}/getCompanyList`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = normalizeQueryString(url, "keyword");
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 10);

    let rows = [...companyListItems];
    if (keyword) {
      const lower = keyword.toLowerCase();
      rows = rows.filter((item) =>
        `${item.companyName} ${item.materialName} ${item.materialCode}`
          .toLowerCase()
          .includes(lower)
      );
    }

    const payload = {
      content: rows.slice(page * size, page * size + size),
      page,
      size,
      totalElements: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / size)),
    };

    const response: ApiResponse<typeof payload> = toApiResponse(payload);
    return HttpResponse.json(response);
  }),
];
