import { useQuery } from "@tanstack/react-query";
import {
  fetchPendingOrders,
  fetchProcessedOrders,
} from "../../request/RequestApi";
import { fetchBOMRecords } from "../../bom/BOMApi";
import { fetchCompanyList } from "../../purchasing/PurchasingApi";
import { fetchPartRecords as fetchInventoryPartRecords } from "../../part/PartApi";
import type {
  PartRecord as InventoryPartRecord,
  PartItem as InventoryPartItem,
} from "../../part/PartTypes";
import { fetchPropertyRecords } from "../../property/PropertyApi";
import type { PropertyRecord } from "../../property/PropertyTypes";
import { fetchInboundNotDoneRecords } from "../../inbound/InboundApi";
import { fetchOutboundNotDoneRecords } from "../../outbound/OutboundApi";
import { fetchUsers } from "../../human/HumanApi";
import { fetchPartRecords as fetchItemPartRecords } from "../../items/parts/PartApi";
import type {
  PendingOrderItem,
  ProcessedOrderItem,
} from "../../request/RequestTypes";

type PendingOrdersSelect = {
  total: number;
  items: PendingOrderItem[];
};

type ProcessedOrdersSelect = {
  total: number;
  items: ProcessedOrderItem[];
};

export function useDashboardData() {
  const extractInventoryItems = (res: unknown): InventoryPartRecord[] => {
    if (typeof res !== "object" || res === null) return [];
    const outer = (res as Record<string, unknown>)["data"] as
      | Record<string, unknown>
      | undefined;
    let itemsUnknown: unknown = outer?.["items"];
    if (!Array.isArray(itemsUnknown)) {
      const inner = outer?.["data"] as Record<string, unknown> | undefined;
      itemsUnknown = inner?.["items"];
    }
    return Array.isArray(itemsUnknown)
      ? (itemsUnknown as InventoryPartRecord[])
      : [];
  };
  const pendingOrders = useQuery({
    queryKey: ["dashboard", "request", "pending"],
    queryFn: () =>
      fetchPendingOrders({
        page: 0,
        size: 20,
      }),
    select: (res): PendingOrdersSelect => ({
      total: res.data.totalElements ?? 0,
      items: res.data.content ?? [],
    }),
    staleTime: 60 * 1000,
  });

  const processedOrders = useQuery({
    queryKey: ["dashboard", "request", "processed"],
    queryFn: () =>
      fetchProcessedOrders({
        page: 0,
        size: 20,
      }),
    select: (res): ProcessedOrdersSelect => ({
      total: res.data.totalElements ?? 0,
      items: res.data.content ?? [],
    }),
    staleTime: 60 * 1000,
  });

  const bomRecords = useQuery({
    queryKey: ["dashboard", "mrp", "bom"],
    queryFn: () =>
      fetchBOMRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const companyRecords = useQuery({
    queryKey: ["dashboard", "purchasing", "companies"],
    queryFn: () =>
      fetchCompanyList({
        page: 0,
        size: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const inventoryParts = useQuery({
    queryKey: ["dashboard", "inventory", "parts"],
    queryFn: () =>
      fetchInventoryPartRecords({
        warehouseCode: undefined,
        partKeyword: "",
        supplierName: "",
        page: 0,
        size: 5,
      }),
    select: (res) => res.data.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const propertyRecords = useQuery({
    queryKey: ["dashboard", "property", "records"],
    queryFn: () =>
      fetchPropertyRecords({
        page: 1,
        size: 100,
      }),
    select: (res) => {
      const payload = res.data ?? { items: [] };
      const items = payload.items ?? [];
      const total = payload.total ?? items.length;

      const valueOf = (entry: PropertyRecord) =>
        (entry.partPrice ?? 0) * (entry.partQuantity ?? 0);

      const sorted = [...items].sort((a, b) => valueOf(b) - valueOf(a));
      const assetValue = items.reduce(
        (acc, item) => acc + (item.partPrice ?? 0) * (item.partQuantity ?? 0),
        0,
      );
      const totalQty = items.reduce(
        (acc, item) => acc + (item.partQuantity ?? 0),
        0,
      );

      const top10Value = sorted
        .slice(0, 10)
        .reduce(
          (acc, i) => acc + (i.partPrice ?? 0) * (i.partQuantity ?? 0),
          0,
        );
      const top10Share = assetValue
        ? Math.round((top10Value / assetValue) * 100)
        : 0;

      let cum = 0;
      let a = 0,
        b = 0,
        c = 0;
      sorted.forEach((i) => {
        const v = (i.partPrice ?? 0) * (i.partQuantity ?? 0);
        const ratio = assetValue ? v / assetValue : 0;
        cum += ratio;
        if (cum <= 0.8) a++;
        else if (cum <= 0.95) b++;
        else c++;
      });

      const warehouseMap = new Map<
        string,
        { value: number; assetValue: number }
      >();
      items.forEach((item) => {
        const warehouseId = item.warehouseId ?? item.warehouseCode ?? "UNKNOWN";
        const existing = warehouseMap.get(warehouseId) || {
          value: 0,
          assetValue: 0,
        };
        warehouseMap.set(warehouseId, {
          value: existing.value + (item.partQuantity ?? 0),
          assetValue:
            existing.assetValue +
            (item.partPrice ?? 0) * (item.partQuantity ?? 0),
        });
      });

      const warehouseDistribution = Array.from(warehouseMap.entries())
        .map(([warehouseId, data]) => ({
          warehouseId,
          value: data.value,
          assetValue: data.assetValue,
        }))
        .sort((a, b) => b.assetValue - a.assetValue);

      return {
        total,
        assetValue,
        totalQty,
        avgUnitPrice: totalQty ? Math.round(assetValue / totalQty) : 0,
        top10Share, // %
        abc: { a, b, c },
        warehouseDistribution,
        rawItems: items,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const inboundRecords = useQuery({
    queryKey: ["dashboard", "inbound", "pending"],
    queryFn: () =>
      fetchInboundNotDoneRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 60 * 1000,
  });

  const outboundRecords = useQuery({
    queryKey: ["dashboard", "outbound", "pending"],
    queryFn: () =>
      fetchOutboundNotDoneRecords({
        page: 1,
        pageSize: 100,
      }),
    select: (res) => ({
      total: res.meta?.total ?? 0,
      items: res.data ?? [],
    }),
    staleTime: 60 * 1000,
  });

  const allInventoryData = useQuery({
    queryKey: ["dashboard", "inventory", "all"],
    queryFn: () =>
      fetchInventoryPartRecords({
        warehouseCode: undefined,
        partKeyword: "",
        supplierName: "",
        page: 0,
        size: 1000,
      }),
    select: (res) => {
      const items: InventoryPartRecord[] = extractInventoryItems(res);
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      let inactiveCount = 0;
      items.forEach((item: InventoryPartRecord) => {
        const dateString = item.lastUpdatedAt ?? item.updatedAt;
        if (!dateString) return;
        const lastUpdated = new Date(dateString);
        if (lastUpdated < ninetyDaysAgo) {
          inactiveCount++;
        }
      });

      const warehouseMap = new Map<
        string,
        {
          critical: number;
          warning: number;
          normal: number;
          total: number;
        }
      >();

      const riskItems: Array<{
        warehouseCode: string;
        partCode: string;
        partName: string;
        currentQty: number;
        safetyQty: number;
        ratio: number;
        severity: "high" | "medium";
      }> = [];

      let totalCritical = 0;
      let totalWarning = 0;
      let totalNormal = 0;

      items.forEach((item: InventoryPartRecord) => {
        const warehouseCode = item.warehouseCode || "UNKNOWN";
        const current = Number(item.onHandQty ?? 0);
        const safety = Number(item.safetyStockQty ?? 0);
        const part: InventoryPartItem | undefined = (
          item as {
            part?: InventoryPartItem;
          }
        ).part;
        const partCode = part?.code ?? "";
        const partName = part?.name ?? "";
        const resolvedPartCode = partCode || partName || "-";
        const resolvedPartName = partName || partCode || "미지정 부품";

        const ratioRaw = safety > 0 ? (current / safety) * 100 : 0;
        const ratio = Math.max(0, Math.round(ratioRaw));

        const warehouse = warehouseMap.get(warehouseCode) || {
          critical: 0,
          warning: 0,
          normal: 0,
          total: 0,
        };

        warehouse.total++;

        if (current <= safety) {
          warehouse.critical++;
          totalCritical++;
          riskItems.push({
            warehouseCode,
            partCode: resolvedPartCode,
            partName: resolvedPartName,
            currentQty: current,
            safetyQty: safety,
            ratio,
            severity: "high",
          });
        } else if (current <= safety * 1.2) {
          warehouse.warning++;
          totalWarning++;
          riskItems.push({
            warehouseCode,
            partCode: resolvedPartCode,
            partName: resolvedPartName,
            currentQty: current,
            safetyQty: safety,
            ratio,
            severity: "medium",
          });
        } else {
          warehouse.normal++;
          totalNormal++;
        }

        warehouseMap.set(warehouseCode, warehouse);
      });

      riskItems.sort((a, b) => a.ratio - b.ratio);

      const warehouseSummary = Array.from(warehouseMap.entries())
        .map(([warehouseCode, data]) => ({
          warehouseCode,
          ...data,
        }))
        .sort((a, b) => b.critical - a.critical || b.warning - a.warning);

      return {
        inactive: {
          total: items.length,
          inactiveCount,
          inactivePercentage:
            items.length > 0 ? (inactiveCount / items.length) * 100 : 0,
        },
        safetyStock: {
          warehouseSummary,
          riskItems,
          totalCritical,
          totalWarning,
          totalNormal,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const inactiveStockData = useQuery({
    queryKey: ["dashboard", "inventory", "inactive-stock"],
    queryFn: () =>
      fetchInventoryPartRecords({
        warehouseCode: undefined,
        partKeyword: "",
        supplierName: "",
        page: 0,
        size: 1000,
      }),
    select: (res) => {
      const items: InventoryPartRecord[] = extractInventoryItems(res);
      const now = new Date();
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      let inactiveCount = 0;
      items.forEach((item: InventoryPartRecord) => {
        const dateString = item.lastUpdatedAt ?? item.updatedAt;
        if (!dateString) return;
        const lastUpdated = new Date(dateString);
        if (lastUpdated < ninetyDaysAgo) {
          inactiveCount++;
        }
      });

      return {
        total: items.length,
        inactiveCount,
        inactivePercentage:
          items.length > 0 ? (inactiveCount / items.length) * 100 : 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const humanRecords = useQuery({
    queryKey: ["dashboard", "human", "users"],
    queryFn: () =>
      fetchUsers({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const itemPartRecords = useQuery({
    queryKey: ["dashboard", "items", "parts"],
    queryFn: () =>
      fetchItemPartRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    pendingOrders,
    processedOrders,
    bomRecords,
    companyRecords,
    inventoryParts,
    propertyRecords,
    inboundRecords,
    outboundRecords,
    humanRecords,
    itemPartRecords,
    inactiveStockData,
    allInventoryData,
  };
}

export async function fetchPods(namespace: string = "default") {
  // 개발/우회 모드에서는 프록시 호출 자체를 생략합니다.
  if (import.meta.env.DEV || import.meta.env.VITE_AUTH_BYPASS === "true") {
    return [
      { name: "api-gateway-0", phase: "Running" },
      { name: "inventory-service-0", phase: "Running" },
      { name: "order-service-0", phase: "Running" },
    ];
  }

  try {
    const res = await fetch(
      `/notification/k8s/pods/list?namespace=${namespace}`,
    );
    if (res.ok) {
      const payload = (await res.json()) as unknown;
      if (Array.isArray(payload)) return payload;
    }
  } catch {
    // fallback으로 처리
  }

  throw new Error("Failed to fetch pods");
}
