export interface MaterialRecord {
  id: number;
  materialName: string;
  materialCode: string;
  createdDate?: string;
}

export interface MaterialCreateDTO {
  materialId: number;
  materialName: string;
  materialCode: string;
}

export type MaterialUpdateDTO = Partial<MaterialCreateDTO>;

export interface MaterialFormModel extends MaterialCreateDTO {
  createdDate?: string;
}

export const toMaterialCreatePayload = (
  dto: MaterialFormModel
): MaterialCreateDTO => ({
  materialId: dto.materialId,
  materialName: dto.materialName.trim(),
  materialCode: dto.materialCode.trim(),
});

export const toMaterialPatchPayload = (
  dto: MaterialFormModel
): MaterialUpdateDTO => {
  const patch: MaterialUpdateDTO = {};
  if (dto.materialCode?.trim()) patch.materialCode = dto.materialCode.trim();
  if (dto.materialName?.trim()) patch.materialName = dto.materialName.trim();
  return patch;
};
