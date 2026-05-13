import { Router } from "express";
import {
  addDecision,
  listDecisions,
  patchDecision,
  removeDecision,
  getInsights,
} from "../controllers/decisionController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/insights", asyncHandler(getInsights));
router.get("/", asyncHandler(listDecisions));
router.post("/", asyncHandler(addDecision));
router.patch("/:id", asyncHandler(patchDecision));
router.delete("/:id", asyncHandler(removeDecision));

export default router;
