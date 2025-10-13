import os from "os";
import fs from "fs";
import path from "path";

export const SESSION_HOME =
  process.env.SESSION_HOME || path.join(os.homedir(), ".mcp-societies");
export const USER_DATA_DIR = path.join(SESSION_HOME, "chromium-profile");
export const STORAGE_STATE = path.join(SESSION_HOME, "storage-state.json");

export function ensureSessionDirs() {
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  fs.mkdirSync(SESSION_HOME, { recursive: true });
}
