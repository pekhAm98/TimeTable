import type { Request, Response } from "express";
import { generatePreview } from "../services/timetable.service.js";
// POST   /preview
// POST   /
// GET    /
// GET    /:id
// POST   /:id/publish
// DELETE /:id
export async function previewTimetable(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const preview = await generatePreview(file, req.body);

    return res.status(200).json({
      success: true,
        data: preview,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Invalid CSV",
    });
  }
}