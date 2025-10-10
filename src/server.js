import express from "express";
import { run } from "./index.js";

const app = express();
app.use(express.json());

app.post("/simulate", async (req, res) => {
  try {
    const out = await run(req.body || {});
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message, details: e.details || null });
  }
});

app.listen(3000, () => console.log("MCP HTTP ready on :3000 POST /simulate"));

