//frontend\src\api\users.js
import client from "./client";

export function listUsers() {
  return client.get("/users").then((r) => r.data);
}

export function createUser(data) {
  return client.post("/users", data).then((r) => r.data);
}

export function updateUser(id, data) {
  return client.put(`/users/${id}`, data).then((r) => r.data);
}

export function deleteUser(id) {
  return client.delete(`/users/${id}`).then((r) => r.data);
}
