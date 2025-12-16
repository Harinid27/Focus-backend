import Session from "../models/Session.js";

// create/save session
export const saveSession = async (req, res) => {
  try {
    const body = req.body;
    const session = await Session.create({
      user: req.user,
      ...body
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get all sessions for logged in user
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete a session
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOneAndDelete({ _id: id, user: req.user });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
