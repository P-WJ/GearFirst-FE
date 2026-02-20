import type { OutboundRecord, OutboundStatus } from "../../outbound/OutboundTypes";
import { isoDate, makeCode, pick, range } from "./utils";
import { partListItems } from "./items.mock";

const STATUSES: OutboundStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "DELAYED",
];

const BRANCHES = [
  "서울 중앙",
  "부산 동부",
  "광주 허브",
  "대전 북부",
  "울산 항만",
];

const WAREHOUSES = ["WH-A1", "WH-A2", "WH-B1", "WH-C2"];

export const outboundRecords: OutboundRecord[] = range(26).map((i) => {
  const status = pick(STATUSES, i);
  const requestedAt = isoDate(-28 + i, 11);
  const expectedShipDate = isoDate(-25 + i, 9);
  const completedAt = status === "COMPLETED" ? isoDate(-8 + i, 16) : null;
  const lines = range(2 + (i % 4)).map((lineIndex) => {
    const part = pick(partListItems, i + lineIndex);
    return {
      lineId: i * 10 + lineIndex + 1,
      product: {
        id: Number(part.id),
        lot: makeCode("LOT", i * 10 + lineIndex + 10, 5),
        code: part.code,
        name: part.name,
        imgUrl: part.imageUrl ?? "",
      },
      orderedQty: 10 + (lineIndex + 1) * 5,
      pickedQty: status === "COMPLETED" ? 10 + (lineIndex + 1) * 5 : 6,
      status: pick(["PENDING", "READY", "COMPLETED", "SHORTAGE"], lineIndex),
    };
  });

  return {
    noteId: 7000 + i,
    shippingNo: makeCode("SHP", i + 1, 5),
    shippedAt: status === "COMPLETED" ? isoDate(-8 + i, 16) : undefined,
    requestedAt,
    expectedShipDate,
    branchName: pick(BRANCHES, i),
    totalQty: lines.reduce((sum, line) => sum + line.orderedQty, 0),
    assigneeName: i % 2 === 0 ? "김민준" : "최다은",
    assigneeDept: i % 2 === 0 ? "물류팀" : "출고팀",
    assigneePhone: i % 2 === 0 ? "010-2211-7788" : "010-4422-8844",
    status,
    warehouseCode: pick(WAREHOUSES, i),
    remark:
      i % 9 === 0
        ? "긴급 출고 건으로 납기 여유가 적습니다. 패킹리스트를 확인하세요."
        : "",
    completedAt,
    itemKindsNumber: lines.length,
    lines,
  };
});
