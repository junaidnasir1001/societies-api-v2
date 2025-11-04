import { defineConfig } from "@trigger.dev/sdk/v3";
import "dotenv/config";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID,
  dirs: ["./src/trigger"],
  // Required by Trigger.dev v4 CLI (min 5s). Adjust per your task runtime.
  maxDuration: "15m",
  // For in-app execution, we don't need bundling. Playwright runs in the same process.
  // Note: For local dev, use USE_TRIGGER=false to run tasks directly (no bundling needed).
  // For production with Trigger.dev, use their hosted workers or configure bundling differently.
});


