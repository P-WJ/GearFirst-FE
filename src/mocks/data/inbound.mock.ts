import type { InboundDetailStatusRaw, InboundLineStatusRaw } from "../../inbound/InboundTypes";
import type { ServerPartListItem } from "../../items/parts/PartTypes";
import { isoDate, makeCode, pick, range } from "./utils";
import { partListItems } from "./items.mock";

export type ServerInboundListItem = {
  noteId: number;
  receivingNo?: string;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;
  status: string;
  warehouseCode?: string;
  requestedAt?: string;
  expectedReceiveDate?: string;
  completedAt: string | null;
};

export type ServerInboundDetail = {
  noteId: number;
  supplierName: string;
  itemKindsNumber: number;
  totalQty: number;
  status: InboundDetailStatusRaw;
  completedAt: string | null;
  receivingNo: string;
  warehouseCode: string | null;
  requestedAt: string;
  expectedReceiveDate: string | null;
  receivedAt: string | null;
  inspectorName: string | null;
  inspectorDept: string | null;
  inspectorPhone: string | null;
  remark: string | null;
  lines: Array<{
    lineId: number;
    product: {
      id: number;
      lot: string;
      code: string;
      name: string;
      imgUrl: string | null;
    };
    orderedQty: number;
    inspectedQty: number;
    status: InboundLineStatusRaw;
  }>;
};

const STATUSES: InboundDetailStatusRaw[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED_OK",
  "COMPLETED_ISSUE",
];

const SUPPLIERS = [
  "Hyundai Steel",
  "Mobis Parts",
  "Daedong Logistics",
  "Sejong Components",
  "Daehan Molds",
  "Korea Precision",
];

const WAREHOUSES = ["WH-A1", "WH-A2", "WH-B1", "WH-C1"];

function makeLines(index: number, parts: ServerPartListItem[]) {
  const lineCount = 2 + (index % 4);
  return range(lineCount).map((lineIndex) => {
    const part = pick(parts, index + lineIndex);
    return {
      lineId: index * 10 + lineIndex + 1,
      product: {
        id: Number(part.id),
        lot: makeCode("LOT", index * 10 + lineIndex + 1, 5),
        code: part.code,
        name: part.name,
        imgUrl: null,
      },
      orderedQty: 20 + (lineIndex + 1) * 5 + (index % 3) * 2,
      inspectedQty: 18 + (lineIndex + 1) * 4 + (index % 4),
      status: pick(["PENDING", "ACCEPTED", "REJECTED"], index + lineIndex),
    };
  });
}

export const inboundListItems: ServerInboundListItem[] = range(24).map((i) => {
  const status = pick(STATUSES, i);
  const requestedAt = isoDate(-25 + i, 9);
  const expectedReceiveDate = isoDate(-22 + i, 10);
  const completedAt =
    status === "COMPLETED_OK" || status === "COMPLETED_ISSUE"
      ? isoDate(-10 + i, 15)
      : null;

  return {
    noteId: 5000 + i,
    receivingNo: makeCode("RCV", i + 1, 5),
    supplierName: pick(SUPPLIERS, i),
    itemKindsNumber: 2 + (i % 4),
    totalQty: 120 + i * 3,
    status,
    warehouseCode: pick(WAREHOUSES, i),
    requestedAt,
    expectedReceiveDate,
    completedAt,
  };
});

export const inboundDetailsById = new Map<number, ServerInboundDetail>(
  inboundListItems.map((item, i) => {
    const lines = makeLines(i, partListItems);
    const totalQty = lines.reduce((sum, line) => sum + line.orderedQty, 0);
    const status = pick(STATUSES, i);
    return [
      item.noteId,
      {
        noteId: item.noteId,
        supplierName: item.supplierName,
        itemKindsNumber: item.itemKindsNumber,
        totalQty,
        status,
        completedAt: item.completedAt,
        receivingNo: item.receivingNo ?? makeCode("RCV", i + 1, 5),
        warehouseCode: item.warehouseCode ?? null,
        requestedAt: item.requestedAt ?? isoDate(-25 + i, 9),
        expectedReceiveDate: item.expectedReceiveDate ?? null,
        receivedAt: item.completedAt,
        inspectorName: i % 2 === 0 ? "Jamie Park" : "Alex Lee",
        inspectorDept: i % 2 === 0 ? "QA" : "Warehouse",
        inspectorPhone: i % 2 === 0 ? "010-5500-1200" : "010-7722-3322",
        remark:
          i % 7 === 0
            ? "Inspection delayed due to minor packaging damage on arrival."
            : "",
        lines,
      },
    ] as const;
  })
);
