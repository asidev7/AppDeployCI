const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

function defaultDataFilePath() {
  // Serverless platforms (ex: Vercel) have a read-only filesystem except `/tmp`.
  // Persisting to `/tmp` is ephemeral but avoids runtime crashes.
  if (process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "appdeployci-items.json");
  }
  return path.join(__dirname, "..", "data", "items.json");
}

async function ensureFileExists(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify({ items: [] }, null, 2), "utf8");
  }
}

async function readState(filePath) {
  await ensureFileExists(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  return { items };
}

async function writeState(filePath, state) {
  await ensureFileExists(filePath);
  await fs.writeFile(filePath, JSON.stringify(state, null, 2), "utf8");
}

function createStorage({ dataFilePath } = {}) {
  const filePath = dataFilePath ?? defaultDataFilePath();

  return {
    async list() {
      const state = await readState(filePath);
      return state.items;
    },

    async add({ title }) {
      const state = await readState(filePath);
      const now = new Date().toISOString();
      const item = {
        id: crypto.randomUUID(),
        title,
        done: false,
        createdAt: now,
        updatedAt: now,
      };
      state.items.unshift(item);
      await writeState(filePath, state);
      return item;
    },

    async toggleDone({ id }) {
      const state = await readState(filePath);
      const item = state.items.find((x) => x.id === id);
      if (!item) return null;
      item.done = !item.done;
      item.updatedAt = new Date().toISOString();
      await writeState(filePath, state);
      return item;
    },

    async remove({ id }) {
      const state = await readState(filePath);
      const before = state.items.length;
      state.items = state.items.filter((x) => x.id !== id);
      if (state.items.length === before) return false;
      await writeState(filePath, state);
      return true;
    },
  };
}

module.exports = { createStorage };
