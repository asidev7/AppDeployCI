const path = require("path");
const os = require("os");
const fs = require("fs/promises");
const { createStorage } = require("../src/storage");
const { createItemHandlers } = require("../src/handlers");

function tmpDataFile() {
  return path.join(os.tmpdir(), `appdeployci-test-${Date.now()}-${Math.random()}.json`);
}

function makeRes() {
  const out = {
    statusCode: 200,
    jsonBody: undefined,
    ended: false,
  };

  const res = {
    status(code) {
      out.statusCode = code;
      return res;
    },
    json(body) {
      out.jsonBody = body;
      return res;
    },
    end() {
      out.ended = true;
      return res;
    },
  };

  return { res, out };
}

describe("API items", () => {
  test("creates, lists, toggles and deletes items", async () => {
    const dataFilePath = tmpDataFile();
    const storage = createStorage({ dataFilePath });
    const handlers = createItemHandlers(storage);

    {
      const { res, out } = makeRes();
      await handlers.list({}, res);
      expect(out.statusCode).toBe(200);
      expect(out.jsonBody.items).toEqual([]);
    }

    let id;
    {
      const { res, out } = makeRes();
      await handlers.create({ body: { title: "Test task" } }, res);
      expect(out.statusCode).toBe(201);
      expect(out.jsonBody.item.title).toBe("Test task");
      expect(out.jsonBody.item.done).toBe(false);
      id = out.jsonBody.item.id;
    }

    {
      const { res, out } = makeRes();
      await handlers.list({}, res);
      expect(out.jsonBody.items.length).toBe(1);
    }

    {
      const { res, out } = makeRes();
      await handlers.toggle({ params: { id } }, res);
      expect(out.statusCode).toBe(200);
      expect(out.jsonBody.item.done).toBe(true);
    }

    {
      const { res, out } = makeRes();
      await handlers.remove({ params: { id } }, res);
      expect(out.statusCode).toBe(204);
      expect(out.ended).toBe(true);
    }

    {
      const { res, out } = makeRes();
      await handlers.list({}, res);
      expect(out.jsonBody.items).toEqual([]);
    }

    await fs.rm(dataFilePath, { force: true });
  });

  test("rejects empty titles", async () => {
    const storage = createStorage({ dataFilePath: tmpDataFile() });
    const handlers = createItemHandlers(storage);

    const { res, out } = makeRes();
    await handlers.create({ body: { title: "   " } }, res);
    expect(out.statusCode).toBe(400);
  });

  test("defaults to tmp storage on Vercel", async () => {
    const prev = process.env.VERCEL;
    process.env.VERCEL = "1";
    try {
      const storage = createStorage();
      const item = await storage.add({ title: "Serverless" });
      expect(item.title).toBe("Serverless");
      const items = await storage.list();
      expect(items.length).toBeGreaterThan(0);
    } finally {
      process.env.VERCEL = prev;
    }
  });
});
