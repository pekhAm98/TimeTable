import {Router} from "express";
import { previewTimetable, getPreviews, getPreviewById, patchPreviewById ,saveConfirmedPreview , deletePreviewById ,publishPreview , timeTableLogs } from "../controllers/timetableController.js";
import { getAllLines, getLineStations,getServicePatterns,createServicePatterns,updateServicePatterns,deleteServicePatterns
//,getJunctions
} from "../controllers/creationController.js";


import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/preview", upload.single("file"), previewTimetable);
router.get("/previews/all", getPreviews);
router.route("/previews/:id").get(getPreviewById).patch(patchPreviewById).delete(deletePreviewById);
router.post("/previews/save", saveConfirmedPreview);
router.post("/previews/:id/publish", publishPreview);
router.post("/previews/publish", publishPreview);
router.get("/logs", timeTableLogs);


//CREATE TIMETABLE ROUTES
router.get("/lines", getAllLines);
router.get("/lines/:lineId/stations", getLineStations);
//router.get("/junctions", getJunctions)
router.route("/lines/:lineId/patterns").get(getServicePatterns).post(createServicePatterns).put(updateServicePatterns).delete(deleteServicePatterns);
//

export default router;



//PATCH /api/timetables/previews/:id