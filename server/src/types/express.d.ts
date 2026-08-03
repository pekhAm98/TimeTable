import type { User } from "better-auth";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: {
        id: string;
        userId: string;
        expiresAt: Date;
      };
    }
  }
}

export {};