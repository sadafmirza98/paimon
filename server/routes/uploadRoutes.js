import { Router } from "express";
import multer from "multer";
import { uploadDocument } from "../controllers/uploadController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.post("/", upload.single("file"), asyncHandler(uploadDocument));

export default router;
