const { Router } = require('express');
const { 
  createConversation, 
  getConvList, 
  deleteConversation,
  getConversationById 
} = require('../controllers/conversation.controller');

const router = Router();

// নতুন কনভার্সেশন তৈরি করার রাউট
router.post("/createConv", createConversation);

// নির্দিষ্ট ইউজারের সমস্ত কনভার্সেশন লিস্ট পাওয়ার রাউট
router.get("/getConvList/:firebaseUid", getConvList);

// নির্দিষ্ট কনভার্সেশন এর ডিটেইলস পাওয়ার রাউট
router.get("/getConv/:conversationId", getConversationById);

// নির্দিষ্ট কনভার্সেশন ডিলেট করার রাউট
router.delete("/deleteConv/:firebaseUid/:chatId", deleteConversation);

module.exports = router;
