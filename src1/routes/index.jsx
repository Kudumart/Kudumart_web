import { landingRooutes } from "./landingRoute";
import { authRoutes } from "./authRoutes";
import { userRoutes } from "./userRoutes";
import { productRoutes } from "./productRoutes";
import { auctionRoutes } from "./auctionRoutes";
import { vendorRoutes } from "./vendorRoutes";
import { adminRoutes } from "./adminRoutes";
import { dropShippingRoutes } from "./dropShippingRoutes";

export const routes = [
  ...landingRooutes,
  ...authRoutes,
  ...userRoutes,
  ...productRoutes,
  ...auctionRoutes,
  ...vendorRoutes,
  ...adminRoutes,
  ...dropShippingRoutes,
];
