import type { Region, UserRecord, WorkType } from "../../human/HumanTypes";
import { isoDate, pick, range } from "./utils";

export const regions: Region[] = [
  { regionId: 1, regionName: "Seoul" },
  { regionId: 2, regionName: "Busan" },
  { regionId: 3, regionName: "Incheon" },
  { regionId: 4, regionName: "Daejeon" },
  { regionId: 5, regionName: "Gwangju" },
];

export const workTypes: WorkType[] = [
  { workTypeId: 1, workTypeName: "Production" },
  { workTypeId: 2, workTypeName: "Logistics" },
  { workTypeId: 3, workTypeName: "Quality" },
  { workTypeId: 4, workTypeName: "Purchasing" },
  { workTypeId: 5, workTypeName: "Planning" },
];

const RANKS = ["STAFF", "SENIOR", "MANAGER", "DIRECTOR"] as const;

export const users: UserRecord[] = range(28).map((i) => {
  const region = pick(regions, i);
  const workType = pick(workTypes, i + 1);
  return {
    id: 6000 + i,
    name: `User ${i + 1}`,
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
