// A popular library for sending HTTP requests in JavaScript.
// If the app is running in development mode, the base URL will be http://localhost:5001/api.
// Otherwise, it will use the relative URL /api, suitable for production.
// Allows sending cookies (such as session/token data) between the browser and the server – needed for user authentication.
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true,
});