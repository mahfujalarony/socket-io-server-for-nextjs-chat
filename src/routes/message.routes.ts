import { Router } from "express";
import { 
  sendMessage, 
  getMessages, 
  deleteMessage 
} from "../controllers/message.controller";

const router = Router();

// Message পাঠানোর রাউট
router.post("/send", sendMessage);

// Conversation এর messages get করার রাউট
router.get("/:conversationId", getMessages);

// Message delete করার রাউট
router.delete("/:messageId", deleteMessage);

export default router;
