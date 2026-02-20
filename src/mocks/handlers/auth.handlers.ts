import { http, HttpResponse } from "msw";
import { USER_BASE_PATH, type ApiResponse } from "../../api";
import { currentUser } from "../data/auth.mock";
import { toApiResponse } from "./utils";

const BASE = USER_BASE_PATH;

export const authHandlers = [
  http.get(`${BASE}/getUser`, () => {
    const response: ApiResponse<typeof currentUser> = toApiResponse(currentUser);
    return HttpResponse.json(response);
  }),
];
