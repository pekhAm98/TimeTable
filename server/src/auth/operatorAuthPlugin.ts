import {
  createAuthEndpoint,
  APIError,
} from "better-auth/api";

import type { BetterAuthPlugin } from "better-auth";

import { z } from "zod";

import { validateOperator } from "../services/operatorAuth.service.js";

export const operatorAuthPlugin = {
  id: "operator-auth",

  endpoints: {
    operatorLogin: createAuthEndpoint(
      "/operator-login",
      {
        method: "POST",

        body: z.object({
          operatorCode: z.string().min(1),
          password: z.string().min(1),
        }),
      },

      async (ctx) => {
        const { operatorCode, password } = ctx.body;

        console.log("🔥 OPERATOR PLUGIN HIT");
        console.log("👤 Operator code:", operatorCode);

        // 1. Authenticate against Sybase
        const operator = await validateOperator(
          operatorCode.trim(),
          password
        );

        console.log(
          "🔐 Validation result:",
          operator
        );

        // ❌ INVALID CREDENTIALS
        if (!operator) {
          console.log(
            "❌ Invalid operator credentials"
          );

          throw new APIError("UNAUTHORIZED", {
            message:
              "Invalid operator code or password",
          });
        }

        console.log(
          "✅ Operator authenticated:",
          {
            operatorId: operator.operatorId,
            operatorCode: operator.operatorCode,
            operatorName: operator.operatorName,
          }
        );

        // 2. Better Auth context
        const {
          internalAdapter,
          createAuthCookie,
        } = ctx.context;

        // 3. Find existing Better Auth user
        const users =
          await internalAdapter.listUsers(
            1,
            0,
            undefined,
            [
              {
                field: "operatorId",
                operator: "eq",
                value: operator.operatorId,
              },
            ]
          );

        let user = users[0];

        // 4. Create Better Auth user
        // on first login
        if (!user) {
          user =
            await internalAdapter.createUser({
              id: crypto.randomUUID(),
              name: operator.operatorName,
              email: `${operator.operatorCode.toLowerCase()}@internal.metro`,
              emailVerified: true,
              operatorId: operator.operatorId,
            } as any);

          console.log(
            "✅ Better Auth user created:",
            {
              id: user.id,
              operatorId: operator.operatorId,
              name: user.name,
            }
          );
        } else {
          console.log(
            "✅ Existing Better Auth user:",
            {
              id: user.id,
              operatorId: operator.operatorId,
              name: user.name,
            }
          );
        }

        // 5. Create Better Auth session
        const session =
          await internalAdapter.createSession(
            user.id,
            false
          );

        console.log(
          "🔐 Session created:",
          {
            id: session.id,
            userId: session.userId,
            expiresAt: session.expiresAt,
          }
        );

        // 6. Create Better Auth cookie
        const cookie =
          createAuthCookie("session_token");

        console.log(
          "🍪 Creating auth cookie:",
          {
            name: cookie.name,
            attributes: cookie.attributes,
          }
        );

        await ctx.setSignedCookie(
          cookie.name,
          session.token,
          ctx.context.secret,
          cookie.attributes
        );

        console.log(
          "🍪 Auth cookie successfully set"
        );

        // 7. Successful login
        return ctx.json({
          message:
            "Operator authenticated and mapped",

          user: {
            id: user.id,
            name: user.name,
            operatorId: operator.operatorId,
          },
        });
      }
    ),
  },
} satisfies BetterAuthPlugin;