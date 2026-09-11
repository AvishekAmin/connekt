let IS_PROD = false;
const server = IS_PROD
  ? "https://connekt-avishek-backend.onrender.com"
  : "http://localhost:8080";

export default server;
