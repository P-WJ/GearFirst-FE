import type { UserInfo } from "../../user/UserTypes";
import { users } from "./human.mock";

const primary = users[0];

export const currentUser: UserInfo = {
  id: primary?.id ?? 1,
  name: primary?.name ?? "User 1",
  regionId: primary?.regionId ?? 1,
  region: primary?.region ?? "Seoul",
  workTypeId: primary?.workTypeId ?? 1,
  workType: primary?.workType ?? "Production",
  rank: primary?.rank ?? "STAFF",
  email: primary?.email ?? "user1@gearfirst.com",
  phoneNum: primary?.phoneNum ?? "010-5500-2200",
};
