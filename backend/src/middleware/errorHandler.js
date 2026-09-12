export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (statusCode >= 500) {
    console.error("Server Error:", err);
  }

  const response = { message };

  if (err.code) {
    response.code = err.code;
  }

  return res.status(statusCode).json(response);
};
