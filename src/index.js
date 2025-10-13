import "dotenv/config";
import { googleLogin } from "./googleLogin.js";
import { runSimulation } from "./societies.js";
import Ajv from "ajv";
import { getBrowser } from "./getBrowser.js";
import { STORAGE_STATE } from "./sessionPaths.js";

const ajv = new Ajv({ allErrors: true });
const outputSchema = {
  type: "object",
  required: ["society", "test", "text", "result", "metadata"],
  properties: {
    society: { type: "string" },
    test: { type: "string" },      // renamed from "template"
    text: { type: "string" },       // renamed from "inputText"
    result: {
      type: "object",
      required: ["plainText", "html"],
      properties: { 
        plainText: { type: "string" }, 
        html: { type: "string" },
        extras: {  // optional structured data
          type: "object",
          properties: {
            impactScore: { type: "object" },
            attention: { type: "object" },
            insights: { type: "string" }
          }
        }
      }
    },
    metadata: {
      type: "object",
      required: ["timingsMs", "runId", "url"],
      properties: {
        timingsMs: { 
          type: "object",
          properties: {
            googleLogin: { type: "number" },
            simulate: { type: "number" },
            total: { type: "number" }
          }
        },
        runId: { type: "string" },
        url: { type: "string" }
      }
    }
  }
};

const validate = ajv.compile(outputSchema);

// Use the new persistent browser management

export async function run({ 
  society = "", 
  test = "",           // renamed from "template"
  text = "",           // renamed from "inputText"
  wsEndpoint = null,   // optional: provider-agnostic
  runId 
} = {}) {
  const t0 = Date.now();
  const timingsMs = { googleLogin: 0, simulate: 0, total: 0 };
  
  const { context, page, mode } = await getBrowser();

  try {
    // Don't do Google login separately - let societies.io handle SSO
    console.error("[skip] Skipping standalone Google login - will use SSO in societies.io");

    const sim = await runSimulation(page, { 
      society, 
      template: test,    // map back to internal naming
      inputText: text,   // map back to internal naming
      email: process.env.GOOGLE_EMAIL,
      password: process.env.GOOGLE_PASSWORD
    });
    timingsMs.simulate = sim.metadata.ms;
    timingsMs.total = Date.now() - t0;

    // Restructure output to match Dan's requirements
    const out = {
      society,
      test,
      text,
      result: {
        plainText: sim.result.plainText,
        html: sim.result.html,
        extras: {
          impactScore: sim.result.impactScore,
          attention: sim.result.attention,
          insights: sim.result.insights
        }
      },
      metadata: {
        timingsMs,
        runId: runId || `run_${Date.now()}`,
        url: sim.metadata.url
      }
    };

    const ok = validate(out);
    if (!ok) {
      const err = new Error("Output schema validation failed");
      err.details = validate.errors;
      throw err;
    }

    // Save storage state after successful run for debugging
    try {
      await context.storageState({ path: STORAGE_STATE });
      console.error("[session] ✅ Storage state saved");
    } catch (storageErr) {
      console.error("[session] ⚠️ Could not save storage state:", storageErr.message);
    }
    
    return out;
  } finally {
    // Close context but profile persists on disk
    try { await context?.close(); } catch {}
    console.error(`[done] mode=${mode} totalMs=${timingsMs.total}`);
  }
}

