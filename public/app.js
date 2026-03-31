async function api(path, options) {
  const res = await fetch(path, options);
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? "request_failed");
  return body;
}

function itemLi(item) {
  const li = document.createElement("li");
  li.className = "item";

  const left = document.createElement("div");
  left.className = "left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!item.done;
  checkbox.addEventListener("change", async () => {
    try {
      await api(`/api/items/${item.id}/toggle`, { method: "PATCH" });
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  });

  const title = document.createElement("span");
  title.textContent = item.title;
  title.className = item.done ? "done" : "";

  left.appendChild(checkbox);
  left.appendChild(title);

  const actions = document.createElement("div");
  actions.className = "actions";

  const del = document.createElement("button");
  del.type = "button";
  del.className = "danger";
  del.textContent = "Supprimer";
  del.addEventListener("click", async () => {
    if (!confirm("Supprimer cette tâche ?")) return;
    try {
      await api(`/api/items/${item.id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  });

  actions.appendChild(del);

  li.appendChild(left);
  li.appendChild(actions);
  return li;
}

async function refresh() {
  const list = document.getElementById("items");
  const empty = document.getElementById("emptyState");

  const data = await api("/api/items");
  list.replaceChildren(...data.items.map(itemLi));
  empty.hidden = data.items.length !== 0;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createForm");
  const input = document.getElementById("titleInput");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    try {
      await api("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      input.value = "";
      await refresh();
    } catch (err) {
      alert(err.message);
    }
  });

  refresh().catch((err) => alert(err.message));
});

