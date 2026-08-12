import { auth } from "../auth/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response, NextFunction } from "express";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("🍪 Incoming cookie:", req.headers.cookie);
    console.log("🍪 Incoming authorization:", req.headers.authorization);

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    console.log("🔐 Better Auth session:", session);

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);

    return res.status(401).json({
      message: "Invalid session",
    });
  }
}