import express from "express";
import { itemController } from "../controllers";
import { checkUserLoggedIn, uploadFiles } from "../middlewares";

const itemRouter = express.Router();

itemRouter
  .route("/add/:itemType")
  .all(checkUserLoggedIn)
  .get(itemController.getAddItem)
  .post(uploadFiles.single("image"), itemController.postAddItem);
itemRouter
  .route("/edit/:itemType/:itemId")
  .all(checkUserLoggedIn)
  .get(itemController.getEditItem)
  .post(uploadFiles.single("image"), itemController.postEditItem);
itemRouter.post(
  "/delete/:itemType/:itemId",
  checkUserLoggedIn,
  itemController.postDeleteItem
);
itemRouter.get(
  "/detail/:itemType/:itemId",
  checkUserLoggedIn,
  itemController.getDetailItem
);
itemRouter.get("/pinned", checkUserLoggedIn, itemController.getPinnedItems);
itemRouter.post(
  "/pinning/:itemType/:itemId",
  checkUserLoggedIn,
  itemController.postPinning
);

export default itemRouter;
