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
exports.getConversationById = exports.deleteConversation = exports.getConvList = exports.createConversation = void 0;
const Conversation_1 = __importDefault(require("../models/Conversation"));
const User_1 = __importDefault(require("../models/User"));
const chat_socket_1 = require("../sockets/chat.socket");
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { participants, type, groupName, groupAvatar } = req.body;
        if (!participants || !Array.isArray(participants) || participants.length < 2) {
            return res.status(400).json({ message: "At least 2 participants are required." });
        }
        // Remove duplicate participants
        const uniqueParticipants = [...new Set(participants.map(p => p.toString()))];
        if (type === "direct") {
            if (uniqueParticipants.length !== 2) {
                return res.status(400).json({ message: "Direct chat must have exactly 2 participants." });
            }
            // Check for existing conversation with these participants
            const sortedParticipants = [...uniqueParticipants].sort();
            const existing = yield Conversation_1.default.findOne({
                type: "direct",
                participants: { $all: sortedParticipants, $size: 2 }
            });
            if (existing) {
                return res.status(200).json({ message: "Conversation already exists.", data: existing });
            }
        }
        else if (type === "group" && (!groupName || groupName.trim() === "")) {
            return res.status(400).json({ message: "Group name is required for group chats." });
        }
        const newConversation = new Conversation_1.default({
            participants: uniqueParticipants,
            type,
            groupName: type === "group" ? groupName : null,
            groupAvatar: type === "group" ? groupAvatar : null,
        });
        yield newConversation.save();
        // Notify all participants via socket
        const io = (0, chat_socket_1.getIO)();
        participants.forEach((userId) => {
            io.to(userId.toString()).emit("new-conversation", newConversation);
        });
        const populatedConversation = yield Conversation_1.default.findById(newConversation._id)
            .populate('participants', 'username avatar firebaseUid isOnline _id');
        return res.status(201).json({
            success: true,
            message: "Conversation created successfully.",
            data: populatedConversation,
        });
    }
    catch (err) {
        console.error("Conversation create error:", err);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});
exports.createConversation = createConversation;
const getConvList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firebaseUid } = req.params;
        const user = yield User_1.default.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const conversations = yield Conversation_1.default.find({ participants: user._id })
            .populate('participants', 'username avatar firebaseUid isOnline _id')
            .sort({ updatedAt: -1 })
            .lean();
        res.status(200).json({ success: true, data: conversations });
    }
    catch (err) {
        console.error("Get conversation list error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});
exports.getConvList = getConvList;
const deleteConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firebaseUid, chatId } = req.params;
        const user = yield User_1.default.findOne({ firebaseUid });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        // Get conversation data before deletion to notify participants
        const conversation = yield Conversation_1.default.findOne({
            _id: chatId,
            participants: user._id,
        }).populate('participants', '_id');
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found or you don't have permission."
            });
        }
        yield Conversation_1.default.findByIdAndDelete(chatId);
        // Notify other participants via socket
        const io = (0, chat_socket_1.getIO)();
        const participantIds = conversation.participants.map((p) => p._id.toString());
        participantIds.forEach((participantId) => {
            if (participantId !== user._id.toString()) {
                io.to(participantId).emit("conversation-deleted", {
                    conversationId: chatId,
                    deletedBy: user._id.toString()
                });
            }
        });
        res.status(200).json({ success: true, message: "Conversation deleted successfully." });
    }
    catch (err) {
        console.error("Delete conversation error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});
exports.deleteConversation = deleteConversation;
const getConversationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        console.log("🔍 Getting conversation by ID:", conversationId);
        // Validate conversationId format
        if (!conversationId || conversationId.length !== 24) {
            console.log("❌ Invalid conversation ID format:", conversationId);
            return res.status(400).json({ success: false, message: "Invalid conversation ID format." });
        }
        const conversation = yield Conversation_1.default.findById(conversationId)
            .populate('participants', 'username avatar firebaseUid isOnline _id');
        console.log("🔍 Database query result:", conversation ? "Found" : "Not found");
        if (!conversation) {
            console.log("❌ Conversation not found in database");
            return res.status(404).json({ success: false, message: "Conversation not found." });
        }
        console.log("✅ Conversation found, returning data");
        res.status(200).json({ success: true, data: conversation });
    }
    catch (err) {
        console.error("❌ Get conversation by ID error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
});
exports.getConversationById = getConversationById;
