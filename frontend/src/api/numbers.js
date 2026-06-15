//frontend\src\api\numbers.js
import client from "./client";

export function listNumbers(params) {
  return client.get("/numbers", { params }).then((r) => r.data);
}

export function assignNumber(userId, note) {
  return client.post("/numbers", { user_id: userId, note }).then((r) => r.data);
}

export function updateNote(id, note) {
  return client.patch(`/numbers/${id}`, { note }).then((r) => r.data);
}

// The export endpoint needs the auth token, so we fetch it as a blob through
// the same client (token attached automatically) and trigger a download.
export async function downloadNumbersCsv(params) {
  const res = await client.get("/numbers/export", {
    params,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(
    new Blob([res.data], { type: "text/csv" })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "nmk_numbers.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
