import { auth } from "../auth/auth.js";
import type{ Request, Response, NextFunction } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Invalid session",
    });
  }
}