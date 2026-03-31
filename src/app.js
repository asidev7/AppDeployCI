const express = require("express");
const path = require("path");
const { createStorage } = require("./storage");

function createApp({ dataFilePath } = {}) {
  const app = express();
  const storage = createStorage({ dataFilePath });

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/items", async (_req, res) => {
    const items = await storage.list();
    res.json({ items });
  });

  app.post("/api/items", async (req, res) => {
    const title = (req.body?.title ?? "").trim();
    if (!title) return res.status(400).json({ error: "title_required" });
    const item = await storage.add({ title });
    res.status(201).json({ item });
  });

  app.patch("/api/items/:id/toggle", async (req, res) => {
    const id = req.params.id;
    const item = await storage.toggleDone({ id });
    if (!item) return res.status(404).json({ error: "not_found" });
    res.json({ item });
  });

  app.delete("/api/items/:id", async (req, res) => {
    const id = req.params.id;
    const ok = await storage.remove({ id });
    if (!ok) return res.status(404).json({ error: "not_found" });
    res.status(204).end();
  });

  return app;
}

module.exports = { createApp };

