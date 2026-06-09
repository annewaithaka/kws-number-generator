//frontend\src\api\client.js
import axios from "axios";

// Where the Flask backend lives. Override with VITE_API_URL in a .env if needed.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_URL });

// Attach the saved login token to every outgoing request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("kws_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server rejects our token (expired or invalid), clear it and send the
// admin back to the login screen.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("kws_token");
      localStorage.removeItem("kws_username");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
