"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const conversation_controller_1 = require("../controllers/conversation.controller");
const router = (0, express_1.Router)();
// নতুন কনভার্সেশন তৈরি করার রাউট
router.post("/createConv", conversation_controller_1.createConversation);
// নির্দিষ্ট ইউজারের সমস্ত কনভার্সেশন লিস্ট পাওয়ার রাউট
router.get("/getConvList/:firebaseUid", conversation_controller_1.getConvList);
// নির্দিষ্ট কনভার্সেশন এর ডিটেইলস পাওয়ার রাউট
router.get("/getConversationById/:conversationId", conversation_controller_1.getConversationById);
// নির্দিষ্ট কনভার্সেশন ডিলেট করার রাউট
router.delete("/deleteConv/:firebaseUid/:chatId", conversation_controller_1.deleteConversation);
exports.default = router;
