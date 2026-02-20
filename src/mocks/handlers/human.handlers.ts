import { http, HttpResponse } from "msw";
import {
  USER_BASE_PATH,
  type ApiPage,
  type ApiResponse,
} from "../../api";
import type { UserRecord } from "../../human/HumanTypes";
import { regions, users, workTypes } from "../data/human.mock";
import { normalizeQueryString, parseNumber, toApiResponse, toPaged } from "./utils";

const BASE = USER_BASE_PATH;

export const humanHandlers = [
  http.get(`${BASE}/getRegion`, () => {
    const response: ApiResponse<typeof regions> = toApiResponse(regions);
    return HttpResponse.json(response);
  }),

  http.get(`${BASE}/getWorkType`, () => {
    const response: ApiResponse<typeof workTypes> = toApiResponse(workTypes);
    return HttpResponse.json(response);
  }),

  http.get(`${BASE}/getAllUser`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = normalizeQueryString(url, "keyword");
    const rank = normalizeQueryString(url, "rank");
    const workTypeId = normalizeQueryString(url, "workTypeId");
    const regionId = normalizeQueryString(url, "regionId");
    const page = parseNumber(url.searchParams.get("page"), 0);
    const size = parseNumber(url.searchParams.get("size"), 10);

    let rows = [...users];

    if (keyword) {
      const lower = keyword.toLowerCase();
      rows = rows.filter((user) =>
        `${user.name} ${user.email} ${user.phoneNum}`
          .toLowerCase()
          .includes(lower)
      );
    }

    if (rank && rank !== "ALL") {
      rows = rows.filter((user) => user.rank === rank);
    }

    if (workTypeId) {
      rows = rows.filter((user) => String(user.workTypeId) === workTypeId);
    }

    if (regionId) {
      rows = rows.filter((user) => String(user.regionId) === regionId);
    }

    const pageData: ApiPage<UserRecord> = toPaged(rows, page, size);
    const response: ApiResponse<ApiPage<UserRecord>> = toApiResponse(pageData);
    return HttpResponse.json(response);
  }),
];
