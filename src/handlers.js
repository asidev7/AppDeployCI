function createItemHandlers(storage) {
  return {
    list: async (_req, res) => {
      const items = await storage.list();
      res.json({ items });
    },

    create: async (req, res) => {
      const title = (req.body?.title ?? "").trim();
      if (!title) return res.status(400).json({ error: "title_required" });
      const item = await storage.add({ title });
      res.status(201).json({ item });
    },

    toggle: async (req, res) => {
      const id = req.params.id;
      const item = await storage.toggleDone({ id });
      if (!item) return res.status(404).json({ error: "not_found" });
      res.json({ item });
    },

    remove: async (req, res) => {
      const id = req.params.id;
      const ok = await storage.remove({ id });
      if (!ok) return res.status(404).json({ error: "not_found" });
      res.status(204).end();
    },
  };
}

module.exports = { createItemHandlers };

