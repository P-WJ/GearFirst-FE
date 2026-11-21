import { categoryHandlers } from "../items/categories/mock/handlers";
import { inboundHandlers } from "./handlers/inbound.handlers";
import { bomHandlers } from "./handlers/bom.handlers";
import { itemsHandlers } from "./handlers/items.handlers";
import { vehicleHandlers } from "./handlers/vehicle.handlers";
import { outboundHandlers } from "./handlers/outbound.handlers";
import { requestHandlers } from "./handlers/request.handlers";
import { purchasingHandlers } from "./handlers/purchasing.handlers";
import { humanHandlers } from "./handlers/human.handlers";
import { propertyHandlers as inventoryHandlers } from "./handlers/property.handlers";
import { authHandlers } from "./handlers/auth.handlers";
import { mutationHandlers } from "./handlers/mutations.handlers";

export const handlers = [
  ...mutationHandlers,
  ...authHandlers,
  ...inboundHandlers,
  ...bomHandlers,
  ...itemsHandlers,
  ...vehicleHandlers,
  ...outboundHandlers,
  ...requestHandlers,
  ...purchasingHandlers,
  ...humanHandlers,
  ...inventoryHandlers,
  ...categoryHandlers,
];
