import type { Request, Response } from "express";
import { validateOperator } from "../services/operatorAuth.service.js";
import { auth } from "../auth/auth.js";
import { randomUUID } from "crypto";

export async function operatorLogin(req: Request, res: Response) {
  try {
    const { operatorCode, password } = req.body;

    if (typeof operatorCode !== "string" || typeof password !== "string" || !operatorCode.trim() || !password) {
      return res.status(400).json({
        message: "Operator code and password are required",
      });
    }

    // 1. Authenticate against Sybase
    const operator = await validateOperator(operatorCode, password);

    if (!operator) {
      return res.status(401).json({
        message: "Invalid operator code or password",
      });
    }

    // 2. Get Better Auth's internal context
    const context = await auth.$context;

    // 3. Find the Better Auth user mapped to this Sybase operator
    const users = await context.internalAdapter.listUsers(1, 0, undefined, [
      {
        field: "operatorId",
        operator: "eq",
        value: operator.operatorId,
      },
    ]);

    let user = users[0];

    // 4. First login -> create Better Auth user
    if (!user) {
      const newUser = {
        id: randomUUID(),
        name: operator.operatorName,
        email: `${operator.operatorCode.toLowerCase()}@internal.metro`,
        emailVerified: true,
        operatorId: operator.operatorId,
      };

      user = await context.internalAdapter.createUser(newUser as any);

      console.log("✅ Better Auth user created:", {
        id: user.id,
        operatorId: operator.operatorId,
        name: user.name,
      });
    } else {
      console.log("✅ Existing Better Auth user:", {
        id: user.id,
        operatorId: operator.operatorId,
        name: user.name,
      });
    }
    const session = await context.internalAdapter.createSession(user.id, false);

    const sessionCookie = context.createAuthCookie("session_token");

    // TEMPORARY: session comes next
    res.cookie(sessionCookie.name, session.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 604800 * 1000,
    });

    return res.status(200).json({
      message: "Operator authenticated and mapped",
      user: {
        id: user.id,
        name: user.name,
        operatorId: operator.operatorId,
      },
    });
  } catch (error) {
    console.error("❌ Operator login failed:", error);

    return res.status(500).json({
      message: "Authentication service unavailable",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
