import fs from "node:fs";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

let loaded = false;

export function loadEnv() {
  if (loaded) return;

  const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
  const serverEnvPath = fileURLToPath(new URL("../../.env", import.meta.url));

  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
  }

  if (fs.existsSync(serverEnvPath)) {
    dotenv.config({ path: serverEnvPath, override: true });
  }

  loaded = true;
}
