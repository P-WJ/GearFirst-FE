import type { PropertyRecord } from "../../property/PropertyTypes";
import { isoDate, pick, range } from "./utils";
import { partListItems } from "./items.mock";

const WAREHOUSES = ["WH-A1", "WH-A2", "WH-B1", "WH-C1", "WH-C2"];

export const inventoryOnHandRecords: PropertyRecord[] = range(24).map((i) => {
  const part = pick(partListItems, i);
  const qty = 20 + (i % 9) * 7;
  const safetyStockQty = 18 + (i % 6) * 5;
  const price = 900 + (i % 6) * 120;
  const lowStock = qty <= safetyStockQty;
  return {
    id: 8000 + i,
    warehouseCode: pick(WAREHOUSES, i),
    warehouseId: `W-${(i % 5) + 1}`,
    supplierName: i % 3 === 0 ? "Hyundai Steel" : "Mobis Parts",
    onHandQty: qty,
    safetyStockQty,
    lowStock,
    partQuantity: qty,
    partPrice: price,
    price: price,
    priceTotal: qty * price,
    updatedAt: isoDate(-7 - (i % 5), 13),
    lastUpdatedAt: isoDate(-10 - (i % 12), 10),
    partCode: part.code,
    partName: part.name,
    part: {
      id: Number(part.id),
      code: part.code,
      name: part.name,
    },
  };
});
