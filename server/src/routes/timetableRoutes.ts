import {Router} from "express";
import { previewTimetable, getPreviews, getPreviewById, patchPreviewById ,saveConfirmedPreview } from "../controllers/timetableController.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/preview", upload.single("file"), previewTimetable);
router.get("/previews/all", getPreviews);
router.route("/previews/:id").get(getPreviewById).patch(patchPreviewById);
router.post("/previews/save", saveConfirmedPreview);
export default router;



//PATCH /api/timetables/previews/:id