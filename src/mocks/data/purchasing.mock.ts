import { isoDate, pick, range } from "./utils";
import { materialRecords } from "./items.mock";

const COMPANIES = [
  "지성소재",
  "대영금속",
  "한일서플라이",
  "세진트레이딩",
  "미래컴포넌트",
  "유진산업",
];

export type CompanyListItem = {
  registNum: number;
  materialName: string;
  materialCode: string;
  companyName: string;
  price: number;
  quantity: number;
  spendDay: number;
  surveyDate: string;
  untilDate: string;
  orderCnt: number;
  createdAt: string;
};

export const companyListItems: CompanyListItem[] = range(26).map((i) => {
  const material = pick(materialRecords, i);
  return {
    registNum: 4000 + i,
    materialName: material.materialName,
    materialCode: material.materialCode,
    companyName: pick(COMPANIES, i),
    price: 500 + (i % 5) * 120,
    quantity: 100 + (i % 6) * 20,
    spendDay: 7 + (i % 4) * 3,
    surveyDate: isoDate(-15 + i, 9),
    untilDate: isoDate(10 + i, 9),
    orderCnt: (i % 4) + 1,
    createdAt: isoDate(-40 + i, 10),
  };
});

export const purchasingMaterials = materialRecords;


