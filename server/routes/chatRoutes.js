import { Router } from "express";
import { chatWithAi } from "../controllers/chatController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(chatWithAi));

export default router;
