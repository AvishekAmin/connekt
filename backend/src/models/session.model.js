import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedBySessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);
