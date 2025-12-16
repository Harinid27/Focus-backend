// backend/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'User is required'],
      index: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: [true, 'Session is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ["TAB_SWITCH", "IDLE", "BLOCKED_URL", "WARNING", "LOCK", "FOCUS_START", "FOCUS_END", "BREAK"],
        message: 'Invalid event type'
      },
      required: [true, 'Event type is required'],
      index: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      validate: {
        validator: function(value) {
          return typeof value === 'object' && value !== null;
        },
        message: 'Meta must be an object'
      }
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    resolved: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create compound indexes for better query performance
eventSchema.index({ user: 1, session: 1, timestamp: -1 });
eventSchema.index({ user: 1, type: 1, timestamp: -1 });
eventSchema.index({ session: 1, type: 1 });

// Virtual for formatted timestamp
eventSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toISOString();
});

export default mongoose.model("Event", eventSchema);
