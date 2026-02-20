import type {
  CancelOrderItem,
  OrderDetailResponse,
  PendingOrderItem,
  ProcessedOrderItem,
} from "../../request/RequestTypes";
import { isoDate, makeCode, pick, range } from "./utils";
import { partListItems } from "./items.mock";

const ENGINEERS = [
  { name: "Minji Park", role: "Purchasing" },
  { name: "Eunwoo Han", role: "QA" },
  { name: "Jisoo Lee", role: "Planner" },
  { name: "Hyun Kim", role: "Logistics" },
];

const BRANCHES = ["B-001", "B-002", "B-003", "B-010", "B-015"];

export const pendingOrders: PendingOrderItem[] = range(20).map((i) => {
  const engineer = pick(ENGINEERS, i);
  return {
    orderId: 9000 + i,
    orderNumber: makeCode("PO", i + 1, 6),
    orderStatus: "PENDING",
    branchCode: pick(BRANCHES, i),
    engineerName: engineer.name,
    engineerRole: engineer.role,
    requestDate: isoDate(-20 + i, 9),
    processedDate: null,
  };
});

export const processedOrders: ProcessedOrderItem[] = range(22).map((i) => {
  const engineer = pick(ENGINEERS, i + 1);
  return {
    orderId: 9200 + i,
    orderNumber: makeCode("PO", i + 30, 6),
    orderStatus: pick(["APPROVED", "SHIPPED", "COMPLETED"], i),
    branchCode: pick(BRANCHES, i + 2),
    engineerName: engineer.name,
    engineerRole: engineer.role,
    requestDate: isoDate(-40 + i, 10),
    processedDate: isoDate(-30 + i, 14),
  };
});

export const cancelOrders: CancelOrderItem[] = range(12).map((i) => {
  const engineer = pick(ENGINEERS, i + 3);
  return {
    orderId: 9500 + i,
    orderNumber: makeCode("PO", i + 60, 6),
    orderStatus: pick(["REJECTED", "CANCELLED"], i),
    branchCode: pick(BRANCHES, i + 1),
    engineerName: engineer.name,
    engineerRole: engineer.role,
    requestDate: isoDate(-60 + i, 9),
    processedDate: isoDate(-58 + i, 11),
  };
});

export const orderDetailsById = new Map<number, OrderDetailResponse>(
  [...pendingOrders, ...processedOrders, ...cancelOrders].map((order, i) => {
    const items = range(2 + (i % 4)).map((lineIndex) => {
      const part = pick(partListItems, i + lineIndex);
      const qty = 5 + (lineIndex + 1) * 3;
      const price = 1200 + (i % 5) * 150;
      return {
        id: Number(part.id),
        partName: part.name,
        partCode: part.code,
        price,
        quantity: qty,
        totalPrice: qty * price,
      };
    });

    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return [
      order.orderId,
      {
        status: 200,
        success: true,
        message: "ok",
        data: {
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          status: order.orderStatus,
          totalPrice,
          requestDate: order.requestDate,
          processedDate: order.processedDate ?? isoDate(-2, 10),
          transferDate: null,
          completedDate: order.orderStatus === "COMPLETED" ? isoDate(-1, 16) : null,
          branchCode: order.branchCode,
          engineerName: order.engineerName,
          engineerRole: order.engineerRole,
          note:
            i % 7 === 0
              ? "This order includes high priority items. Confirm delivery schedule with supplier."
              : "",
          items,
        },
      },
    ] as const;
  })
);
