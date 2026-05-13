import { Router } from "express";
import { addMemory, listMemories, removeMemory } from "../controllers/memoryController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listMemories));
router.post("/", asyncHandler(addMemory));
router.delete("/:id", asyncHandler(removeMemory));

export default router;
