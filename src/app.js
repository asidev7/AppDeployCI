const express = require("express");
const path = require("path");
const { createStorage } = require("./storage");
const { createItemHandlers } = require("./handlers");

function createApp({ dataFilePath } = {}) {
  const app = express();
  const storage = createStorage({ dataFilePath });
  const handlers = createItemHandlers(storage);

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/items", handlers.list);
  app.post("/api/items", handlers.create);
  app.patch("/api/items/:id/toggle", handlers.toggle);
  app.delete("/api/items/:id", handlers.remove);

  return app;
}

module.exports = { createApp };
