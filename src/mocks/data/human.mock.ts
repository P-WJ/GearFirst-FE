import type { Region, UserRecord, WorkType } from "../../human/HumanTypes";
import { isoDate, pick, range } from "./utils";

export const regions: Region[] = [
  { regionId: 1, regionName: "서울" },
  { regionId: 2, regionName: "부산" },
  { regionId: 3, regionName: "인천" },
  { regionId: 4, regionName: "대전" },
  { regionId: 5, regionName: "광주" },
];

export const workTypes: WorkType[] = [
  { workTypeId: 1, workTypeName: "생산" },
  { workTypeId: 2, workTypeName: "물류" },
  { workTypeId: 3, workTypeName: "품질" },
  { workTypeId: 4, workTypeName: "구매" },
  { workTypeId: 5, workTypeName: "기획" },
];

const RANKS = ["STAFF", "SENIOR", "MANAGER", "DIRECTOR"] as const;

export const users: UserRecord[] = range(28).map((i) => {
  const region = pick(regions, i);
  const workType = pick(workTypes, i + 1);
  return {
    id: 6000 + i,
    name: `사용자 ${i + 1}`,
    regionId: region.regionId,
    region: region.regionName,
    workTypeId: workType.workTypeId,
    workType: workType.workTypeName,
    rank: pick(RANKS, i),
    personalEmail: `user${i + 1}@example.com`,
    email: `user${i + 1}@gearfirst.com`,
    phoneNum: `010-55${(10 + i).toString().padStart(2, "0")}-22${
      (30 + i).toString().padStart(2, "0")
    }`,
    createdAt: isoDate(-120 + i, 9),
    updatedAt: isoDate(-5 - (i % 12), 15),
  } as UserRecord;
});
