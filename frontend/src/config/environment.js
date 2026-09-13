const IS_PROD = import.meta.env.PROD || import.meta.env.MODE === "production";

const server =
  import.meta.env.VITE_BACKEND_URL ||
  (IS_PROD
    ? "https://connekt-avishek-backend.onrender.com"
    : "http://localhost:8080");

export default server;
