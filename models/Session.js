import mongoose from "mongoose";

const distractionSchema = new mongoose.Schema({
  time: String,
  reason: String,
  duration: String,     // formatted duration (e.g., "5m 30s")
  durationMs: Number    // duration in milliseconds
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "Focus Session" },
  startTime: Date,
  endTime: Date,
  duration: Number, // seconds
  distractions: [distractionSchema],
  warnings: { type: Number, default: 0 },
  date: String // YYYY-MM-DD or locale string
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);
