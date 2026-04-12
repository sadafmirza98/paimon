import { Router } from "express";
import {
  deleteHistory,
  getHistory,
} from "../controllers/historyController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getHistory));
router.delete("/", asyncHandler(deleteHistory));

export default router;
