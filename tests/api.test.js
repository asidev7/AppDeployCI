const request = require("supertest");
const path = require("path");
const os = require("os");
const fs = require("fs/promises");
const { createApp } = require("../src/app");

function tmpDataFile() {
  return path.join(os.tmpdir(), `appdeployci-test-${Date.now()}-${Math.random()}.json`);
}

describe("API items", () => {
  test("creates, lists, toggles and deletes items", async () => {
    const dataFilePath = tmpDataFile();
    const app = createApp({ dataFilePath });

    const list1 = await request(app).get("/api/items");
    expect(list1.statusCode).toBe(200);
    expect(list1.body.items).toEqual([]);

    const created = await request(app).post("/api/items").send({ title: "Test task" });
    expect(created.statusCode).toBe(201);
    expect(created.body.item.title).toBe("Test task");
    expect(created.body.item.done).toBe(false);

    const id = created.body.item.id;

    const list2 = await request(app).get("/api/items");
    expect(list2.body.items.length).toBe(1);

    const toggled = await request(app).patch(`/api/items/${id}/toggle`);
    expect(toggled.statusCode).toBe(200);
    expect(toggled.body.item.done).toBe(true);

    const deleted = await request(app).delete(`/api/items/${id}`);
    expect(deleted.statusCode).toBe(204);

    const list3 = await request(app).get("/api/items");
    expect(list3.body.items).toEqual([]);

    await fs.rm(dataFilePath, { force: true });
  });

  test("rejects empty titles", async () => {
    const app = createApp({ dataFilePath: tmpDataFile() });
    const res = await request(app).post("/api/items").send({ title: "   " });
    expect(res.statusCode).toBe(400);
  });
});

