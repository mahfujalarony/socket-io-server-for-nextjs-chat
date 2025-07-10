import { Router } from "express";
import { Message } from "../models/Message";

const router = Router();

router.get("/:roomId", async (req, res) => {
  const messages = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
  res.json(messages);
});

router.post("/", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.status(201).json(msg);
});

export default router;
