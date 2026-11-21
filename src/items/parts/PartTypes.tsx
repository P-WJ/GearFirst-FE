import { trimOrUndefined, toBoolean } from "../../utils/string";

export interface ServerPartCategory {
  id: number | string;
  name: string;
}
export interface ServerPartListItem {
  id: number | string;
  code: string;
  name: string;
  price?: number | null;
  imageUrl?: string | null;
  safetyStockQty?: number | null;
  enabled?: boolean;
  category?: ServerPartCategory | null;
  categoryId?: number | string | null;
  categoryName?: string | null;
  carModelIds?: Array<number | string>;
  carModelNames?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface ServerPartDetail extends ServerPartListItem {
  description?: string | null;
}

export interface PartRecord {
  partId: string;
  partCode: string;
  partName: string;
  price: number;
  safetyStockQty: number | null;
  category: { id: number | string; name: string };
  carModelNames: string[];
  imageUrl?: string;
  enabled?: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface PartDetailRecord extends PartRecord {
  enabled: boolean;
}

export interface PartFormModel {
  partCode: string;
  partName: string;
  partPrice: number;
  categoryId: number | string;
  safetyQty: number;
  imageUrl?: string;
  enabled?: boolean;
}

export interface PartCreateDTO {
  code: string;
  name: string;
  price: number;
  safetyStockQty: number;
  categoryId: number | string;
  imageUrl?: string;
}
export type PartUpdateDTO = Partial<PartCreateDTO> & { enabled?: boolean };

function normalizePartForm(form: PartFormModel) {
  return {
    code: form.partCode.trim(),
    name: form.partName.trim(),
    price: Number(form.partPrice),
    safetyQty: Number(form.safetyQty),
    categoryId:
      typeof form.categoryId === "string"
        ? form.categoryId.trim()
        : Number(form.categoryId),
    imageUrl: trimOrUndefined(form.imageUrl),
    enabled: toBoolean(form.enabled),
  };
}

export function toPartCreateDTO(form: PartFormModel): PartCreateDTO {
  const n = normalizePartForm(form);
  const dto: PartCreateDTO = {
    code: n.code,
    name: n.name,
    price: n.price,
    safetyStockQty: n.safetyQty,
    categoryId: n.categoryId,
  };
  if (n.imageUrl !== undefined) dto.imageUrl = n.imageUrl;
  return dto;
}

export function toPartUpdateDTO(form: PartFormModel): PartUpdateDTO {
  const n = normalizePartForm(form);
  const patch: PartUpdateDTO = {};
  if (n.code) patch.code = n.code;
  if (n.name) patch.name = n.name;
  if (!Number.isNaN(n.price)) patch.price = n.price;
  if (!Number.isNaN(n.safetyQty)) patch.safetyStockQty = n.safetyQty;
  if (n.categoryId !== undefined) patch.categoryId = n.categoryId;
  if (n.imageUrl !== undefined) patch.imageUrl = n.imageUrl;
  if (n.enabled !== undefined) patch.enabled = n.enabled;
  return patch;
}

const toCategory = (
  source: ServerPartListItem | ServerPartDetail
): { id: number | string; name: string } => {
  const fromObject = source.category;
  const id =
    fromObject?.id ??
    (source.categoryId !== undefined && source.categoryId !== null
      ? source.categoryId
      : 0);
  const name =
    fromObject?.name ??
    (source.categoryName !== undefined && source.categoryName !== null
      ? source.categoryName
      : "");
  return {
    id,
    name,
  };
};

const normalizeCarModels = (names?: string[] | null): string[] =>
  Array.isArray(names) && names.length > 0 ? names.filter(Boolean) : [];

const normalizeSafetyStock = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export function mapServerToPartRecord(
  s: ServerPartListItem | ServerPartDetail
): PartRecord {
  return {
    partId: String(s.id),
    partCode: s.code,
    partName: s.name,
    price: Number(s.price ?? 0),
    safetyStockQty: normalizeSafetyStock(s.safetyStockQty),
    category: toCategory(s),
    carModelNames: normalizeCarModels(s.carModelNames),
    imageUrl: s.imageUrl || undefined,
    enabled: "enabled" in s ? Boolean(s.enabled) : undefined,
    createdDate: s.createdAt ?? "",
    updatedDate: s.updatedAt ?? "",
  };
}

export function mapServerToPartDetail(s: ServerPartDetail): PartDetailRecord {
  const base = mapServerToPartRecord(s);
  return {
    ...base,
    enabled: Boolean(s.enabled),
  };
}
