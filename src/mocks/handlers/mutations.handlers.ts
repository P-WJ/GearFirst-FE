import { http, HttpResponse } from "msw";
import {
  AUTH_ENDPOINTS,
  INVENTORY_BASE_PATH,
  ORDER_BASE_PATH,
  USER_BASE_PATH,
  WAREHOUSE_BASE_PATH,
} from "../../api";
import type { BOMCreateDTO } from "../../bom/BOMTypes";
import type {
  CarModelCreateDTO,
  CarModelUpdateDTO,
  PartCarModelCreateDTO,
  PartCarModelUpdateDTO,
  ServerCarModelPart,
  ServerPartCarModel,
} from "../../carModel/CarModelTypes";
import type { CreateUserDTO, UpdateUserDTO, UserRecord } from "../../human/HumanTypes";
import type {
  CategoryCreateDTO,
  CategoryUpdateDTO,
} from "../../items/categories/CategoryTypes";
import type {
  MaterialCreateDTO,
  MaterialRecord,
  MaterialUpdateDTO,
} from "../../items/materials/MaterialTypes";
import type {
  PartCreateDTO,
  PartUpdateDTO,
  ServerPartDetail,
  ServerPartListItem,
} from "../../items/parts/PartTypes";
import { formatDate } from "../shared/utils";
import { bomItems, bomMaterialsById } from "../data/bom.mock";
import { regions, users, workTypes } from "../data/human.mock";
import {
  categoryDetails,
  categoryRecords,
  materialRecords,
  partCategories,
  partDetails,
  partListItems,
} from "../data/items.mock";
import { companyListItems } from "../data/purchasing.mock";
import {
  cancelOrders,
  orderDetailsById,
  pendingOrders,
  processedOrders,
} from "../data/request.mock";
import {
  carModelPartsByCarModelId,
  carModels,
  partCarModelsByPartId,
} from "../data/vehicle.mock";
import { toApiResponse } from "./utils";

const PARTS_BASE = `${WAREHOUSE_BASE_PATH}/parts`;
const CAR_MODELS_BASE = `${WAREHOUSE_BASE_PATH}/car-models`;
const CATEGORY_BASES = [
  `${WAREHOUSE_BASE_PATH}/parts/categories`,
  "/warehouse/api/v1/parts/categories",
];

const now = () => formatDate(new Date());

const ok = <T>(data: T, message = "ok") =>
  HttpResponse.json(toApiResponse(data, message));

const fail = (status: number, message: string) =>
  HttpResponse.json(
    { status, success: false, message, data: null },
    { status }
  );

function nextId(ids: Array<number | string | undefined>, fallback: number) {
  const nums = ids.map(Number).filter(Number.isFinite);
  return nums.length ? Math.max(...nums) + 1 : fallback;
}

function removeWhere<T>(list: T[], predicate: (item: T) => boolean) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (predicate(list[i])) list.splice(i, 1);
  }
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function findCategory(id: number | string | null | undefined) {
  return partCategories.find((c) => String(c.id) === String(id)) ?? null;
}

function syncPartCarModels(partId: number) {
  const mappings = partCarModelsByPartId.get(partId) ?? [];
  const ids = mappings.map((m) => Number(m.carModelId));
  const names = mappings.map((m) => m.carModelName ?? "");
  for (const list of [partListItems, partDetails]) {
    const part = list.find((p) => Number(p.id) === partId);
    if (part) {
      part.carModelIds = ids;
      part.carModelNames = names;
    }
  }
}

const partHandlers = [
  http.post(PARTS_BASE, async ({ request }) => {
    const body = await readJson<PartCreateDTO>(request);
    if (!body?.code || !body?.name) return fail(400, "부품 코드와 이름은 필수입니다.");
    if (partListItems.some((p) => p.code === body.code)) {
      return fail(409, "이미 존재하는 부품 코드입니다.");
    }
    const category = findCategory(body.categoryId);
    const listItem: ServerPartListItem = {
      id: nextId(partListItems.map((p) => p.id), 2000),
      code: body.code,
      name: body.name,
      price: Number(body.price) || 0,
      safetyStockQty: Number(body.safetyStockQty) || 0,
      enabled: true,
      category,
      categoryId: category?.id ?? null,
      categoryName: category?.name ?? null,
      carModelIds: [],
      carModelNames: [],
      imageUrl: body.imageUrl ?? null,
      createdAt: now(),
      updatedAt: now(),
    };
    const created: ServerPartDetail = { ...listItem, description: null };
    partListItems.unshift(listItem);
    partDetails.unshift(created);
    return ok(created, "부품 생성 성공");
  }),

  http.patch(`${PARTS_BASE}/:id`, async ({ params, request }) => {
    const id = String(params.id);
    const body = (await readJson<PartUpdateDTO>(request)) ?? {};
    const detail = partDetails.find((p) => String(p.id) === id);
    if (!detail) return fail(404, "부품을 찾을 수 없습니다.");
    const category =
      body.categoryId !== undefined ? findCategory(body.categoryId) : undefined;
    for (const list of [partListItems, partDetails]) {
      const part = list.find((p) => String(p.id) === id);
      if (!part) continue;
      if (body.code !== undefined) part.code = body.code;
      if (body.name !== undefined) part.name = body.name;
      if (body.price !== undefined) part.price = Number(body.price);
      if (body.safetyStockQty !== undefined) {
        part.safetyStockQty = Number(body.safetyStockQty);
      }
      if (body.enabled !== undefined) part.enabled = body.enabled;
      if (body.imageUrl !== undefined) part.imageUrl = body.imageUrl;
      if (category) {
        part.category = category;
        part.categoryId = category.id;
        part.categoryName = category.name;
      }
      part.updatedAt = now();
    }
    for (const bom of bomItems) {
      if (bom.partId !== id) continue;
      bom.partCode = detail.code;
      bom.partName = detail.name;
    }
    for (const parts of carModelPartsByCarModelId.values()) {
      for (const entry of parts) {
        if (String(entry.id) !== id) continue;
        entry.code = detail.code;
        entry.name = detail.name;
        if (detail.category) {
          entry.category = { id: Number(detail.category.id), name: detail.category.name };
        }
      }
    }
    return ok(detail, "부품 수정 성공");
  }),

  http.delete(`${PARTS_BASE}/:id`, ({ params }) => {
    const id = String(params.id);
    if (!partListItems.some((p) => String(p.id) === id)) {
      return fail(404, "부품을 찾을 수 없습니다.");
    }
    removeWhere(partListItems, (p) => String(p.id) === id);
    removeWhere(partDetails, (p) => String(p.id) === id);
    partCarModelsByPartId.delete(Number(id));
    for (const parts of carModelPartsByCarModelId.values()) {
      removeWhere(parts, (p) => String(p.id) === id);
    }
    return ok({ deleted: true }, "부품 삭제 성공");
  }),
];

const categoryHandlers = CATEGORY_BASES.flatMap((base) => [
  http.post(base, async ({ request }) => {
    const body = await readJson<CategoryCreateDTO>(request);
    const name = body?.name?.trim();
    if (!name) return fail(400, "카테고리 이름이 유효하지 않습니다.");
    if (categoryRecords.some((c) => c.name === name)) {
      return fail(409, "이미 존재하는 카테고리 이름입니다.");
    }
    const record = {
      id: nextId(categoryRecords.map((c) => c.id), 1),
      name,
      description: body?.description ?? "",
    };
    categoryRecords.unshift(record);
    categoryDetails.unshift({ ...record, createdAt: now(), updatedAt: now() });
    partCategories.unshift({ id: record.id, name: record.name });
    return ok(record, "부품 카테고리 생성 성공");
  }),

  http.patch(`${base}/:id`, async ({ params, request }) => {
    const id = String(params.id);
    const body = (await readJson<CategoryUpdateDTO>(request)) ?? {};
    const record = categoryRecords.find((c) => String(c.id) === id);
    if (!record) return fail(404, "카테고리를 찾을 수 없습니다.");
    const detail = categoryDetails.find((c) => String(c.id) === id);
    const option = partCategories.find((c) => String(c.id) === id);
    for (const target of [record, detail, option]) {
      if (!target) continue;
      if (body.name !== undefined) target.name = body.name;
      if (body.description !== undefined && "description" in target) {
        target.description = body.description;
      }
    }
    if (detail) detail.updatedAt = now();
    if (body.name !== undefined) {
      for (const list of [partListItems, partDetails]) {
        for (const part of list) {
          if (String(part.categoryId) !== id) continue;
          part.categoryName = body.name;
          if (part.category) part.category = { ...part.category, name: body.name };
        }
      }
      for (const parts of carModelPartsByCarModelId.values()) {
        for (const entry of parts) {
          if (entry.category && String(entry.category.id) === id) {
            entry.category = { ...entry.category, name: body.name };
          }
        }
      }
    }
    return ok(record, "부품 카테고리 수정 성공");
  }),

  http.delete(`${base}/:id`, ({ params }) => {
    const id = String(params.id);
    if (!categoryRecords.some((c) => String(c.id) === id)) {
      return fail(404, "카테고리를 찾을 수 없습니다.");
    }
    removeWhere(categoryRecords, (c) => String(c.id) === id);
    removeWhere(categoryDetails, (c) => String(c.id) === id);
    removeWhere(partCategories, (c) => String(c.id) === id);
    return ok({ deleted: true }, "부품 카테고리 삭제 성공");
  }),
]);

const materialHandlers = [
  http.post(`${INVENTORY_BASE_PATH}/addMaterial`, async ({ request }) => {
    const body = await readJson<MaterialCreateDTO[]>(request);
    const items = Array.isArray(body) ? body : [];
    if (items.length === 0) return fail(400, "등록할 자재가 없습니다.");
    const created: MaterialRecord[] = [];
    for (const item of items) {
      if (materialRecords.some((m) => m.materialCode === item.materialCode)) {
        return fail(409, `이미 존재하는 자재 코드입니다: ${item.materialCode}`);
      }
      const record: MaterialRecord = {
        id: nextId(materialRecords.map((m) => m.id), 1000),
        materialCode: item.materialCode,
        materialName: item.materialName,
        createdDate: now(),
      };
      materialRecords.unshift(record);
      created.push(record);
    }
    return ok(created, "자재 등록 성공");
  }),

  http.patch(
    `${INVENTORY_BASE_PATH}/updateMaterial/:id`,
    async ({ params, request }) => {
      const id = String(params.id);
      const body = (await readJson<MaterialUpdateDTO>(request)) ?? {};
      const record = materialRecords.find((m) => String(m.id) === id);
      if (!record) return fail(404, "자재를 찾을 수 없습니다.");
      if (body.materialCode) record.materialCode = body.materialCode;
      if (body.materialName) record.materialName = body.materialName;
      for (const materials of bomMaterialsById.values()) {
        for (const m of materials) {
          if (String(m.materialId) !== id) continue;
          m.materialCode = record.materialCode;
          m.materialName = record.materialName;
        }
      }
      return ok(record, "자재 수정 성공");
    }
  ),

  http.delete(`${INVENTORY_BASE_PATH}/deleteMaterial`, async ({ request }) => {
    const body = await readJson<Array<{ materialId: number }>>(request);
    const ids = new Set(
      (Array.isArray(body) ? body : []).map((m) => String(m.materialId))
    );
    if (ids.size === 0) return fail(400, "삭제할 자재가 없습니다.");
    removeWhere(materialRecords, (m) => ids.has(String(m.id)));
    for (const materials of bomMaterialsById.values()) {
      removeWhere(materials, (m) => ids.has(String(m.materialId)));
    }
    return ok({ deleted: true }, "자재 삭제 성공");
  }),
];

const bomHandlers = [
  http.post(
    `${INVENTORY_BASE_PATH}/addMaterialList/:partId`,
    async ({ params, request }) => {
      const partId = String(params.partId);
      const body = await readJson<BOMCreateDTO>(request);
      const infos = body?.materialInfos ?? [];
      if (infos.length === 0) return fail(400, "등록할 자재가 없습니다.");
      const part = partListItems.find((p) => String(p.id) === partId);
      if (!part) return fail(404, "부품을 찾을 수 없습니다.");

      let bom = bomItems.find((b) => b.partId === partId);
      if (!bom) {
        const bomCodeId = nextId(bomItems.map((b) => b.bomCodeId), 3000);
        bom = {
          bomCodeId,
          bomCode: `BOM-${String(bomCodeId - 2999).padStart(5, "0")}`,
          category: part.categoryName ?? "기타",
          partId,
          partCode: part.code,
          partName: part.name,
          createdAt: now(),
        };
        bomItems.unshift(bom);
        bomMaterialsById.set(bomCodeId, []);
      }

      const materials = bomMaterialsById.get(bom.bomCodeId) ?? [];
      for (const info of infos) {
        const material = materialRecords.find(
          (m) => Number(m.id) === Number(info.materialId)
        );
        if (!material) continue;
        const existing = materials.find(
          (m) => Number(m.materialId) === Number(material.id)
        );
        if (existing) {
          existing.materialQuantity = Number(info.quantity);
        } else {
          materials.push({
            materialId: Number(material.id),
            materialName: material.materialName,
            materialCode: material.materialCode,
            materialPrice: 1000,
            materialQuantity: Number(info.quantity),
          });
        }
      }
      bomMaterialsById.set(bom.bomCodeId, materials);
      return ok({ bomCodeId: bom.bomCodeId }, "BOM 등록 성공");
    }
  ),

  http.post(
    `${INVENTORY_BASE_PATH}/deleteMaterialList/:partId`,
    async ({ params, request }) => {
      const partId = String(params.partId);
      const body = await readJson<{ materialIds?: number[] }>(request);
      const ids = new Set((body?.materialIds ?? []).map(Number));
      const bom = bomItems.find((b) => b.partId === partId);
      if (!bom) return fail(404, "BOM을 찾을 수 없습니다.");
      const materials = bomMaterialsById.get(bom.bomCodeId) ?? [];
      removeWhere(materials, (m) => ids.has(Number(m.materialId)));
      if (materials.length === 0) {
        removeWhere(bomItems, (b) => b.bomCodeId === bom.bomCodeId);
        bomMaterialsById.delete(bom.bomCodeId);
      }
      return ok({ ok: true }, "BOM 자재 삭제 성공");
    }
  ),
];

const carModelHandlers = [
  http.post(CAR_MODELS_BASE, async ({ request }) => {
    const body = await readJson<CarModelCreateDTO>(request);
    const name = body?.name?.trim();
    if (!name) return fail(400, "차량 모델 이름은 필수입니다.");
    if (carModels.some((m) => m.name === name)) {
      return fail(409, "이미 존재하는 차량 모델입니다.");
    }
    const created = {
      id: nextId(carModels.map((m) => m.id), 1),
      name,
      enabled: body?.enabled ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    carModels.unshift(created);
    carModelPartsByCarModelId.set(created.id, []);
    return ok(created, "차량 모델 생성 성공");
  }),

  http.patch(`${CAR_MODELS_BASE}/:id/enable`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await readJson<CarModelUpdateDTO>(request)) ?? {};
    const model = carModels.find((m) => m.id === id);
    if (!model) return fail(404, "차량 모델을 찾을 수 없습니다.");
    if (body.name !== undefined) model.name = body.name;
    if (body.enabled !== undefined) model.enabled = body.enabled;
    model.updatedAt = now();
    return ok(model, "차량 모델 상태 변경 성공");
  }),

  http.post(`${PARTS_BASE}/:partId/car-models`, async ({ params, request }) => {
    const partId = Number(params.partId);
    const body = await readJson<PartCarModelCreateDTO>(request);
    const model = carModels.find((m) => m.id === Number(body?.carModelId));
    const part = partListItems.find((p) => Number(p.id) === partId);
    if (!model || !part) return fail(404, "부품 또는 차량 모델을 찾을 수 없습니다.");

    const mappings = partCarModelsByPartId.get(partId) ?? [];
    if (mappings.some((m) => m.carModelId === model.id)) {
      return fail(409, "이미 존재하는 부품-차량 모델 매핑입니다.");
    }
    const created: ServerPartCarModel = {
      id: nextId(
        [...partCarModelsByPartId.values()].flat().map((m) => m.id),
        100
      ),
      carModelId: model.id,
      carModelName: model.name,
      partId,
      enabled: body?.enabled ?? true,
      note: body?.note,
      createdAt: now(),
      updatedAt: now(),
    };
    mappings.push(created);
    partCarModelsByPartId.set(partId, mappings);

    const modelParts = carModelPartsByCarModelId.get(model.id!) ?? [];
    if (!modelParts.some((p) => Number(p.id) === partId)) {
      const entry: ServerCarModelPart = {
        id: partId,
        code: part.code,
        name: part.name,
        category: part.category
          ? { id: Number(part.category.id), name: part.category.name }
          : undefined,
      };
      modelParts.push(entry);
      carModelPartsByCarModelId.set(model.id!, modelParts);
    }
    syncPartCarModels(partId);
    return ok(created, "부품-차량 모델 매핑 생성 성공");
  }),

  http.patch(
    `${PARTS_BASE}/:partId/car-models/:carModelId`,
    async ({ params, request }) => {
      const partId = Number(params.partId);
      const carModelId = Number(params.carModelId);
      const body = (await readJson<PartCarModelUpdateDTO>(request)) ?? {};
      const mapping = (partCarModelsByPartId.get(partId) ?? []).find(
        (m) => m.carModelId === carModelId
      );
      if (!mapping) return fail(404, "부품-차량 모델 매핑을 찾을 수 없습니다.");
      if (body.note !== undefined) mapping.note = body.note;
      if (body.enabled !== undefined) mapping.enabled = body.enabled;
      mapping.updatedAt = now();
      return ok(mapping, "부품-차량 모델 매핑 수정 성공");
    }
  ),

  http.delete(`${PARTS_BASE}/:partId/car-models/:carModelId`, ({ params }) => {
    const partId = Number(params.partId);
    const carModelId = Number(params.carModelId);
    const mappings = partCarModelsByPartId.get(partId) ?? [];
    if (!mappings.some((m) => m.carModelId === carModelId)) {
      return fail(404, "부품-차량 모델 매핑을 찾을 수 없습니다.");
    }
    removeWhere(mappings, (m) => m.carModelId === carModelId);
    removeWhere(
      carModelPartsByCarModelId.get(carModelId) ?? [],
      (p) => Number(p.id) === partId
    );
    syncPartCarModels(partId);
    return ok({ deleted: true }, "부품-차량 모델 매핑 삭제 성공");
  }),
];

function toUserRecord(
  dto: CreateUserDTO | UpdateUserDTO,
  id: number
): UserRecord {
  const region = regions.find((r) => r.regionId === Number(dto.regionId));
  const workType = workTypes.find(
    (w) => w.workTypeId === Number(dto.workTypeId)
  );
  return {
    id,
    name: dto.name,
    regionId: Number(dto.regionId),
    region: region?.regionName ?? "",
    workTypeId: Number(dto.workTypeId),
    workType: workType?.workTypeName ?? "",
    rank: dto.rank,
    email: dto.email,
    personalEmail: dto.personalEmail,
    phoneNum: dto.phoneNum,
  };
}

const userHandlers = [
  http.post(AUTH_ENDPOINTS.SIGN_UP, async ({ request }) => {
    const body = await readJson<CreateUserDTO>(request);
    if (!body?.name || !body?.email) return fail(400, "요청 값이 입력되지 않았습니다.");
    if (users.some((u) => u.email === body.email)) {
      return fail(409, "이미 존재하는 이메일입니다.");
    }
    const created = toUserRecord(body, nextId(users.map((u) => u.id), 6000));
    users.unshift(created);
    return ok(created, "사용자 등록 성공");
  }),

  http.post(`${USER_BASE_PATH}/updateUser`, async ({ request }) => {
    const body = await readJson<UpdateUserDTO>(request);
    const index = users.findIndex((u) => u.id === Number(body?.userId));
    if (!body || index < 0) return fail(404, "존재하지 않는 사용자입니다.");
    const current = users[index];
    users[index] = {
      ...toUserRecord(
        { ...body, personalEmail: body.personalEmail ?? current.personalEmail ?? "" },
        current.id
      ),
    };
    return ok(users[index], "사용자 수정 성공");
  }),

  http.delete(`${USER_BASE_PATH}/deleteUser`, ({ request }) => {
    const email = new URL(request.url).searchParams.get("email") ?? "";
    if (!users.some((u) => u.email === email)) {
      return fail(404, "존재하지 않는 사용자입니다.");
    }
    removeWhere(users, (u) => u.email === email);
    return ok({ deleted: true }, "사용자 삭제 성공");
  }),

  http.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, async ({ request }) => {
    const body = await readJson<{ newPassword?: string; confirmPassword?: string }>(
      request
    );
    if (!body?.newPassword || body.newPassword !== body.confirmPassword) {
      return fail(400, "새 비밀번호가 일치하지 않습니다.");
    }
    return ok(true, "비밀번호 변경 성공");
  }),
];

function decideOrder(orderId: number, status: "APPROVED" | "REJECTED", note: string) {
  const index = pendingOrders.findIndex((o) => o.orderId === orderId);
  if (index < 0) return false;
  const [order] = pendingOrders.splice(index, 1);
  const processedDate = now();
  const decided = { ...order, orderStatus: status, processedDate };
  if (status === "APPROVED") processedOrders.unshift(decided);
  else cancelOrders.unshift(decided);

  const detail = orderDetailsById.get(orderId);
  if (detail) {
    detail.data.status = status;
    detail.data.processedDate = processedDate;
    detail.data.note = note;
  }
  return true;
}

const orderHandlers = [
  http.patch(
    `${ORDER_BASE_PATH}/purchase-orders/:orderId/approve`,
    async ({ params, request }) => {
      const body = await readJson<{ note?: string }>(request);
      if (!decideOrder(Number(params.orderId), "APPROVED", body?.note ?? "")) {
        return fail(409, "이미 처리된 발주 건 입니다.");
      }
      return ok(null, "발주가 승인되었습니다.");
    }
  ),

  http.patch(
    `${ORDER_BASE_PATH}/purchase-orders/:orderId/reject`,
    async ({ params, request }) => {
      const body = await readJson<{ note?: string }>(request);
      if (!decideOrder(Number(params.orderId), "REJECTED", body?.note ?? "")) {
        return fail(409, "이미 처리된 발주 건 입니다.");
      }
      return ok(null, "발주가 반려되었습니다.");
    }
  ),
];

const purchasingHandlers = [
  http.post(`${INVENTORY_BASE_PATH}/addCompany`, async ({ request }) => {
    const body = await readJson<{
      materialCode: string;
      materialName: string;
      price: number | string;
      companyName: string;
      quantity: number | string;
      spentDay: number | string;
      surveyDate: string;
      untilDate: string;
    }>(request);
    if (!body?.companyName || !body?.materialCode) {
      return fail(400, "요청 값이 입력되지 않았습니다.");
    }
    const created = {
      registNum: nextId(companyListItems.map((c) => c.registNum), 4000),
      materialName: body.materialName,
      materialCode: body.materialCode,
      companyName: body.companyName,
      price: Number(body.price) || 0,
      quantity: Number(body.quantity) || 0,
      spendDay: Number(body.spentDay) || 0,
      surveyDate: body.surveyDate,
      untilDate: body.untilDate,
      orderCnt: 0,
      createdAt: now(),
    };
    companyListItems.unshift(created);
    return ok(created, "자재 납품 업체 등록 성공");
  }),

  http.post(`${INVENTORY_BASE_PATH}/selectCompany`, async ({ request }) => {
    const body = await readJson<Array<{ id: number; orderCnt: number }>>(request);
    const selections = Array.isArray(body) ? body : [];
    if (selections.length === 0) return fail(400, "선택된 업체가 없습니다.");
    for (const selection of selections) {
      const company = companyListItems.find(
        (c) => c.registNum === Number(selection.id)
      );
      if (company) company.orderCnt += Number(selection.orderCnt) || 1;
    }
    return ok({ selected: selections.length }, "자재 납품 업체 선정 성공");
  }),
];

const sessionHandlers = [
  http.post("*/logout", () => ok(null, "로그아웃 되었습니다")),
  http.post("/notification/notifications/:id/read", () => ok(null, "ok")),
];

export const mutationHandlers = [
  ...categoryHandlers,
  ...carModelHandlers,
  ...partHandlers,
  ...materialHandlers,
  ...bomHandlers,
  ...userHandlers,
  ...orderHandlers,
  ...purchasingHandlers,
  ...sessionHandlers,
];
