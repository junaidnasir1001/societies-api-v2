import { run } from "./index.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const kv = Object.fromEntries(args.filter(a=>a.startsWith("--")).map(a => {
  const [k, ...rest] = a.replace(/^--/,"").split("=");
  return [k, rest.join("=")];
}));

const demo = "demo" in kv;

const payload = demo ? {
  society: "Startup Investors",
  test: "Article",
  text: "testing"
} : {
  society: kv.society || "",
  test: kv.test || kv.template || "",      // accept both for compatibility
  text: kv.text || kv.inputText || "",     // accept both for compatibility
  wsEndpoint: kv.wsEndpoint || null        // optional provider-agnostic
};

run(payload).then(out => {
  const jsonOutput = JSON.stringify(out, null, 2);
  
  // Always print to console
  console.log(jsonOutput);
  
  // Auto-save to runs/<timestamp>.json (unless --output overrides)
  const outputFile = kv.output || (() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5); // 2025-10-09T20-30-45
    const runsDir = 'runs';
    
    // Create runs directory if it doesn't exist
    if (!existsSync(runsDir)) {
      mkdirSync(runsDir, { recursive: true });
    }
    
    return join(runsDir, `${timestamp}.json`);
  })();
  
  writeFileSync(outputFile, jsonOutput, "utf-8");
  console.error(`\n✅ Saved to: ${outputFile}`);
  
  process.exit(0);
}).catch(e => {
  console.error("ERROR:", e.message);
  if (e.details) console.error(e.details);
  process.exit(1);
});

