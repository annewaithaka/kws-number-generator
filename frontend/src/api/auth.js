//frontend\src\api\auth.js
import client from "./client";

export function changePassword(currentPassword, newPassword) {
  return client
    .post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    })
    .then((r) => r.data);
}
