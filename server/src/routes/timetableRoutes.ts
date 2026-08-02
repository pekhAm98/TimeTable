import {Router} from "express";
import { previewTimetable } from "../controllers/timetableController.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/preview", upload.single("file"), previewTimetable);

export default router;