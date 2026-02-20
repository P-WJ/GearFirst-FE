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
  "기어",
  "샤프트",
  "베어링",
  "하우징",
  "센서",
  "컨트롤러",
  "씰",
  "커버",
  "브래킷",
  "커플러",
  "밸브",
  "펌프",
  "매니폴드",
  "모터",
  "인버터",
  "로터",
  "스테이터",
  "하우징 캡",
  "마운트",
  "액추에이터",
];

const CAR_MODELS = [
  "IONIQ 6",
  "GENESIS G80",
  "아반떼",
  "쏘나타",
  "투싼",
  "팰리세이드",
  "코나",
  "SANTA FE",
  "STARIA",
  "NEXO",
  "K5",
  "K8",
  "EV6",
  "EV9",
  "쏘렌토",
  "모하비",
  "GV70",
  "GV80",
  "IONIQ 5",
  "텔루라이드",
];

export const categoryRecords: CategoryRecord[] = CATEGORY_NAMES.map(
  (name, index) => ({
    id: index + 1,
    name,
    description: `${name} 관련 부품 및 자재`,
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
  materialName: makeName("자재", i + 1),
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
    name: makeName("부품", i + 1),
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
      ? "토크 부하에 민감한 품목으로 조립 시 주의가 필요합니다."
      : `${item.category?.name ?? "일반"} 모듈에서 사용하는 표준 부품입니다.`,
}));

export const carModelNames = CAR_MODELS;
