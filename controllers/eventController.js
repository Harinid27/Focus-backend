// backend/controllers/eventController.js
import Event from "../models/Event.js";
import Session from "../models/Session.js";

// POST /api/events
export const createEvent = async (req, res) => {
  try {
    const { sessionId, type, message, meta, timestamp } = req.body;

    if (!sessionId || !type) {
      return res.status(400).json({ message: "sessionId and type are required" });
    }

    // ensure session belongs to this user
    const session = await Session.findOne({ _id: sessionId, user: req.user });
    if (!session) {
      return res.status(404).json({ message: "Session not found for this user" });
    }

    const event = await Event.create({
      user: req.user,
      session: sessionId,
      type,
      message,
      meta: meta || {},
      timestamp: timestamp || new Date(),
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/events/:sessionId
export const getEventsForSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const events = await Event.find({
      user: req.user,
      session: sessionId,
    }).sort({ timestamp: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
