import type {
  ServerBOMItem,
  ServerBOMMaterialItem,
} from "../../bom/BOMTypes";
import { dateOnly, makeCode, pick, range } from "./utils";
import { materialRecords, partListItems } from "./items.mock";

const CATEGORIES = [
  "변속기",
  "구동계",
  "배터리",
  "섀시",
  "바디",
  "내장",
];

export const bomItems: ServerBOMItem[] = range(22).map((i) => {
  const part = pick(partListItems, i);
  return {
    bomCodeId: 3000 + i,
    bomCode: makeCode("BOM", i + 1, 5),
    category: pick(CATEGORIES, i),
    partId: String(part.id),
    partCode: part.code,
    partName: part.name,
    createdAt: dateOnly(-80 + i * 2),
  };
});

export const bomMaterialsById = new Map<number, ServerBOMMaterialItem[]>(
  bomItems.map((bom, i) => {
    const materialCount = 3 + (i % 5);
    const materials = range(materialCount).map((idx) => {
      const material = pick(materialRecords, i + idx);
      return {
        materialId: material.id,
        materialName: material.materialName,
        materialCode: material.materialCode,
        materialPrice: 800 + (idx + 1) * 120 + (i % 4) * 50,
        materialQuantity: 2 + (idx % 3) * 3 + (i % 4),
      };
    });
    return [bom.bomCodeId, materials] as const;
  })
);
