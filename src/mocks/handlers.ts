import { bomHandlers } from "../bom/mock/handlers";
import { partHandlers as partsHandlers } from "../items/parts/mock/handlers";
import { handlers as inboundHandlers } from "../inbound/mock/handlers";
import { propertyHandlers } from "../property/mock/handlers";
import { materialHandlers } from "../items/materials/mock/handlers";
import { categoryHandlers } from "../items/categories/mock/handlers";
import { inboundHandlers as inboundApiHandlers } from "./handlers/inbound.handlers";
import { bomHandlers as bomApiHandlers } from "./handlers/bom.handlers";
import { itemsHandlers } from "./handlers/items.handlers";
import { vehicleHandlers } from "./handlers/vehicle.handlers";
import { outboundHandlers } from "./handlers/outbound.handlers";
import { requestHandlers } from "./handlers/request.handlers";
import { purchasingHandlers } from "./handlers/purchasing.handlers";
import { humanHandlers } from "./handlers/human.handlers";
import { propertyHandlers as inventoryHandlers } from "./handlers/property.handlers";
import { authHandlers } from "./handlers/auth.handlers";

export const handlers = [
  ...authHandlers,
  ...inboundApiHandlers,
  ...bomApiHandlers,
  ...itemsHandlers,
  ...vehicleHandlers,
  ...outboundHandlers,
  ...requestHandlers,
  ...purchasingHandlers,
  ...humanHandlers,
  ...inventoryHandlers,
  ...categoryHandlers,
  ...inboundHandlers,
  ...bomHandlers,
  ...partsHandlers,
  ...materialHandlers,
  ...propertyHandlers,
];
