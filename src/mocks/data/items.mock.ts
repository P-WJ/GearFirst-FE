import type {
  CategoryDetailRecord,
  CategoryRecord,
} from "../../items/categories/CategoryTypes";
import type { MaterialRecord } from "../../items/materials/MaterialTypes";
import type {
  ServerPartCategory,
  ServerPartDetail,
  ServerPartListItem,
} from "../../items/parts/PartTypes";
import { dateOnly, isoDate, makeCode, makeName, pick, range } from "./utils";

const CATEGORY_NAMES = [
  "Gear",
  "Shaft",
  "Bearing",
  "Housing",
  "Sensor",
  "Controller",
  "Seal",
  "Cover",
  "Bracket",
  "Coupler",
  "Valve",
  "Pump",
  "Manifold",
  "Motor",
  "Inverter",
  "Rotor",
  "Stator",
  "Housing-Cap",
  "Mount",
  "Actuator",
];

const CAR_MODELS = [
  "IONIQ 6",
  "GENESIS G80",
  "AVANTE",
  "SONATA",
  "TUCSON",
  "PALISADE",
  "KONA",
  "SANTA FE",
  "STARIA",
  "NEXO",
  "K5",
  "K8",
  "EV6",
  "EV9",
  "SORRENTO",
  "MOHAVE",
  "GV70",
  "GV80",
  "IONIQ 5",
  "TELLURIDE",
];

export const categoryRecords: CategoryRecord[] = CATEGORY_NAMES.map(
  (name, index) => ({
    id: index + 1,
    name,
    description: `${name} related parts and materials`,
  })
);

export const categoryDetails: CategoryDetailRecord[] = categoryRecords.map(
  (record, index) => ({
    ...record,
    createdAt: isoDate(-60 + index, 10),
    updatedAt: isoDate(-5 - (index % 7), 14),
  })
);

export const materialRecords: MaterialRecord[] = range(24).map((i) => ({
  id: 1000 + i,
  materialCode: makeCode("MAT", i + 1),
  materialName: makeName("Material", i + 1),
  createdDate: dateOnly(-90 + i * 2),
}));

export const partCategories: ServerPartCategory[] = categoryRecords.map(
  (record) => ({
    id: record.id,
    name: record.name,
  })
);

export const partListItems: ServerPartListItem[] = range(30).map((i) => {
  const category = pick(partCategories, i);
  return {
    id: 2000 + i,
    code: makeCode("PRT", i + 1),
    name: makeName("Part", i + 1),
    price: 1000 + (i % 7) * 250 + i * 12,
    safetyStockQty: i % 5 === 0 ? 0 : 20 + (i % 8) * 5,
    enabled: i % 6 !== 0,
    category,
    categoryId: category.id,
    categoryName: category.name,
    carModelIds: [1 + (i % 10), 1 + ((i + 3) % 10)],
    carModelNames: [pick(CAR_MODELS, i), pick(CAR_MODELS, i + 3)],
    imageUrl: null,
    createdAt: isoDate(-120 + i * 3, 9),
    updatedAt: isoDate(-10 - (i % 12), 15),
  };
});

export const partDetails: ServerPartDetail[] = partListItems.map((item, i) => ({
  ...item,
  description:
    i % 9 === 0
      ? "Long description: torque load sensitive, requires careful handling during assembly."
      : `Standard part used in ${item.category?.name ?? "general"} modules.`,
}));

export const carModelNames = CAR_MODELS;
