import type {
  ServerCarModel,
  ServerCarModelPart,
  ServerPartCarModel,
} from "../../carModel/CarModelTypes";
import { isoDate, pick, range } from "./utils";
import { carModelNames, partListItems, partCategories } from "./items.mock";

export const carModels: ServerCarModel[] = carModelNames.map((name, index) => ({
  id: index + 1,
  name,
  enabled: index % 5 !== 0,
  note: index % 6 === 0 ? "한정판 시리즈" : undefined,
  createdAt: isoDate(-200 + index * 5, 9),
  updatedAt: isoDate(-7 - (index % 8), 14),
}));

export const partCarModelsByPartId = new Map<number, ServerPartCarModel[]>(
  range(20).map((i) => {
    const part = pick(partListItems, i);
    const mapped = range(3 + (i % 2)).map((idx) => {
      const carModel = pick(carModels, i + idx);
      return {
        id: 100 + i * 10 + idx,
        carModelId: carModel.id,
        carModelName: carModel.name,
        partId: Number(part.id),
        enabled: idx % 2 === 0,
        note: idx % 3 === 0 ? "주요 적용 차종" : undefined,
        createdAt: isoDate(-30 + i, 10),
        updatedAt: isoDate(-3 - idx, 15),
      };
    });
    return [Number(part.id), mapped] as const;
  })
);

export const carModelPartsByCarModelId = new Map<number, ServerCarModelPart[]>(
  carModels.map((carModel, i) => {
    const partCount = 4 + (i % 4);
    const parts = range(partCount).map((idx) => {
      const part = pick(partListItems, i + idx);
      const category = pick(partCategories, i + idx);
      return {
        id: Number(part.id),
        code: part.code,
        name: part.name,
        category: {
          id: Number(category.id),
          name: category.name,
        },
      };
    });
    return [carModel.id ?? i + 1, parts] as const;
  })
);
