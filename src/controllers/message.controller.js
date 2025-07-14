"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.getMessages = exports.sendMessage = exports.saveMessage = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const chat_socket_1 = require("../sockets/chat.socket");
// Message save করার জন্য socket এ ব্যবহার হবে
const saveMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId, senderId, content, messageType = 'text', fileUrl } = data;
    console.log("Saving message:", { conversationId, senderId, content, messageType, fileUrl });
    try {
        const message = yield Message_1.default.create({
            conversationId,
            sender: senderId,
            content,
            messageType,
            fileUrl,
            timestamp: new Date(),
        });
        // Conversation এর lastMessage update করা
        yield Conversation_1.default.findByIdAndUpdate(conversationId, {
            lastMessage: content,
            lastActivity: new Date()
        });
        // Message populate করা
        const populatedMessage = yield Message_1.default.findById(message._id)
            .populate('sender', 'username avatar firebaseUid fileUrl _id');
        return populatedMessage;
    }
    catch (error) {
        console.error("Save message error:", error);
        throw error;
    }
});
exports.saveMessage = saveMessage;
// HTTP route এর জন্য message send করা
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, senderId, content, messageType = 'text', fileUrl } = req.body;
        if (!conversationId || !senderId || !content) {
            return res.status(400).json({
                success: false,
                message: "ConversationId, senderId এবং content আবশ্যক।"
            });
        }
        // Message save করা
        const message = yield (0, exports.saveMessage)({ conversationId, senderId, content, messageType, fileUrl });
        // Real-time এ participants দের পাঠানো
        const conversation = yield Conversation_1.default.findById(conversationId)
            .populate('participants', '_id');
        if (conversation) {
            const io = (0, chat_socket_1.getIO)();
            console.log("📡 Emitting new message to participants");
            // Conversation room এ emit করি
            io.to(conversationId).emit("new_message", {
                message,
                conversationId
            });
            // Individual user rooms এও emit করি (backup)
            conversation.participants.forEach((participant) => {
                if (participant._id.toString() !== senderId) {
                    console.log(`📤 Sending to user: ${participant._id.toString()}`);
                    io.to(participant._id.toString()).emit("new_message", {
                        message,
                        conversationId
                    });
                }
            });
        }
        res.status(201).json({
            success: true,
            message: "Message সফলভাবে পাঠানো হয়েছে।",
            data: message
        });
    }
    catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({
            success: false,
            message: "Message পাঠাতে সমস্যা হয়েছে।"
        });
    }
});
exports.sendMessage = sendMessage;
// Conversation এর সব messages get করা
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        console.log("🔍 Getting messages for conversation:", conversationId);
        console.log("📄 Pagination:", { page, limit });
        // Validate conversationId format
        if (!conversationId || conversationId.length !== 24) {
            console.log("❌ Invalid conversation ID format:", conversationId);
            return res.status(400).json({ success: false, message: "Invalid conversation ID format." });
        }
        const skip = (Number(page) - 1) * Number(limit);
        const messages = yield Message_1.default.find({ conversationId })
            .populate('sender', 'username avatar firebaseUid _id')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean();
        console.log(`📝 Found ${messages.length} messages for conversation`);
        // Messages কে reverse করা যাতে oldest first হয়
        const reversedMessages = messages.reverse();
        res.status(200).json({
            success: true,
            data: reversedMessages,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: yield Message_1.default.countDocuments({ conversationId })
            }
        });
    }
    catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            success: false,
            message: "Messages load করতে সমস্যা হয়েছে।"
        });
    }
});
exports.getMessages = getMessages;
// Message delete করা
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.params;
        // const { userId } = req.body;
        const message = yield Message_1.default.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message খুঁজে পাওয়া যায়নি।"
            });
        }
        yield Message_1.default.findByIdAndDelete(messageId);
        // Real-time এ participants দের জানানো
        const conversation = yield Conversation_1.default.findById(message.conversationId)
            .populate('participants', '_id');
        if (conversation) {
            const io = (0, chat_socket_1.getIO)();
            // Conversation room এ emit করি
            io.to(message.conversationId.toString()).emit("message_deleted", {
                messageId,
                conversationId: message.conversationId.toString()
            });
            // Individual user rooms এও emit করি (backup)
            conversation.participants.forEach((participant) => {
                io.to(participant._id.toString()).emit("message_deleted", {
                    messageId,
                    conversationId: message.conversationId.toString()
                });
            });
        }
        res.status(200).json({
            success: true,
            message: "Message সফলভাবে delete করা হয়েছে।"
        });
    }
    catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({
            success: false,
            message: "Message delete করতে সমস্যা হয়েছে।"
        });
    }
});
exports.deleteMessage = deleteMessage;
