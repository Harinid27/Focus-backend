// backend/routes/eventRoutes.js
import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createEvent,
  getEventsForSession,
} from "../controllers/eventController.js";

const router = express.Router();

// log a new event
router.post("/", protect, createEvent);

// get all events for one session
router.get("/:sessionId", protect, getEventsForSession);

export default router;
