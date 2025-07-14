"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const router = (0, express_1.Router)();
// Message পাঠানোর রাউট
router.post("/send", message_controller_1.sendMessage);
// Conversation এর messages get করার রাউট
router.get("/:conversationId", message_controller_1.getMessages);
// Message delete করার রাউট
router.delete("/delete/:messageId", message_controller_1.deleteMessage);
exports.default = router;
