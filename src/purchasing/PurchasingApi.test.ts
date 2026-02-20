import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fetchCompanyCandidates, fetchCompanyList } from "./PurchasingApi";

const BASE = "http://localhost:8080/inventory/api/v1";

const sample = {
  registNum: 1001,
  materialName: "Bolt",
  materialCode: "MAT-001",
  companyName: "Vendor A",
  price: 1200,
  quantity: 300,
  spendDay: 7,
  surveyDate: "2026-01-01",
  untilDate: "2026-02-01",
  orderCnt: 2,
  createdAt: "2026-01-01",
};

const server = setupServer(
  http.get(`${BASE}/getCompanyList`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        content: [sample],
        totalElements: 1,
        page: 0,
        size: 10,
        totalPages: 1,
      },
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("PurchasingApi", () => {
  it("maps company list response to PurchasingRecord shape", async () => {
    const result = await fetchCompanyList({ page: 0, size: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].purchasingId).toBe("1001");
    expect(result.data[0].status).toBe("등록");
    expect(result.meta.total).toBe(1);
  });

  it("maps candidates response to CompanyRecord shape", async () => {
    const result = await fetchCompanyCandidates({
      endDate: "20260201",
      keyword: "Bolt",
    });

    expect(result).toHaveLength(1);
    expect(result[0].companyId).toBe(1001);
    expect(result[0].requiredPeriodInDays).toBe(7);
  });
});
