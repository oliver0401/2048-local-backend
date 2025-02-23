import { Router } from "express";
import {
  storeSeedHandler,
  getSeedHandler,
  storeConfirmHandler,
  getPrivateKeyHandler,
} from "../controller";

export const appRouter = Router();

appRouter.post("/store-seed", storeSeedHandler);
appRouter.post("/get-seed", getSeedHandler);
appRouter.put("/store-confirm", storeConfirmHandler);
appRouter.post("/get-private-key", getPrivateKeyHandler);
