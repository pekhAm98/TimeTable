import {Router} from "express";
import { previewTimetable, getPreviews, getPreviewById, patchPreviewById ,saveConfirmedPreview , deletePreviewById ,publishPreview} from "../controllers/timetableController.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/preview", upload.single("file"), previewTimetable);
router.get("/previews/all", getPreviews);
router.route("/previews/:id").get(getPreviewById).patch(patchPreviewById).delete(deletePreviewById);
router.post("/previews/save", saveConfirmedPreview);
router.post("/previews/:id/publish", publishPreview);
router.post("/previews/publish", publishPreview);
export default router;



//PATCH /api/timetables/previews/:id