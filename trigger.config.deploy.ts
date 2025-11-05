import { defineConfig } from "@trigger.dev/sdk/v3";
import "dotenv/config";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID,
  dirs: ["./src/trigger"],
  maxDuration: "15m",
});
