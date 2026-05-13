import { Router } from "express";
import {
  addContext,
  listContexts,
  patchContext,
  removeContext,
} from "../controllers/contextController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listContexts));
router.post("/", asyncHandler(addContext));
router.patch("/:id", asyncHandler(patchContext));
router.delete("/:id", asyncHandler(removeContext));

export default router;
