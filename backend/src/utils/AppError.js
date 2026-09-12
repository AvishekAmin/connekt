export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    if (code) {
      this.code = code;
    }
  }
}
