import { Router } from 'express';
import { 
  createConversation, 
  getConvList, 
  deleteConversation,
  getConversationById 
} from '../controllers/conversation.controller';

const router = Router();

// নতুন কনভার্সেশন তৈরি করার রাউট
router.post("/createConv", createConversation);

// নির্দিষ্ট ইউজারের সমস্ত কনভার্সেশন লিস্ট পাওয়ার রাউট
router.get("/getConvList/:firebaseUid", getConvList);

// নির্দিষ্ট কনভার্সেশন এর ডিটেইলস পাওয়ার রাউট
router.get("/getConversationById/:conversationId", getConversationById);

// নির্দিষ্ট কনভার্সেশন ডিলেট করার রাউট
router.delete("/deleteConv/:firebaseUid/:chatId", deleteConversation);

export default router;
