import { Router } from "express";
import multer from "multer";
import {
  deleteDocument,
  forgetDocument,
  getDocument,
  listDocuments,
  restoreDocument,
  uploadDocument,
} from "../controllers/uploadController.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.post("/",          upload.single("file"), asyncHandler(uploadDocument));
router.get("/",                                  asyncHandler(listDocuments));
router.get("/:id",                               asyncHandler(getDocument));
router.delete("/:id",                            asyncHandler(deleteDocument));
router.patch("/:id/forget",                      asyncHandler(forgetDocument));
router.patch("/:id/restore",                     asyncHandler(restoreDocument));

export default router;
