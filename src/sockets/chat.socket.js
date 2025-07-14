"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = void 0;
let io;
// Chat events handle করার জন্য function
const chatSocket = (socket, ioInstance) => {
    // Global io reference save করা
    io = ioInstance;
    console.log("🔗 Chat socket handler activated for:", socket.id);
    // User একটি room এ join করবে
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`✅ User ${userId} joined their room`);
    });
    // Private message পাঠানোর জন্য
    socket.on("send_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        console.log("📨 Message received:", data);
        try {
            // Message save করা database এ
            const { saveMessage } = yield Promise.resolve().then(() => __importStar(require("../controllers/message.controller")));
            const savedMessage = yield saveMessage({
                conversationId: data.conversationId,
                senderId: data.senderId,
                content: data.content,
                messageType: data.messageType || 'text'
            });
            // Message sender কে confirmation পাঠানো
            socket.emit("message_sent", {
                success: true,
                message: savedMessage
            });
            // অন্য participants দের message পাঠানো
            (_a = data.participants) === null || _a === void 0 ? void 0 : _a.forEach((participantId) => {
                if (participantId !== data.senderId) {
                    socket.to(participantId).emit("new_message", {
                        message: savedMessage,
                        conversationId: data.conversationId
                    });
                }
            });
        }
        catch (error) {
            console.error("Send message error:", error);
            socket.emit("message_error", {
                success: false,
                error: "Message পাঠাতে সমস্যা হয়েছে।"
            });
        }
    }));
    // New conversation তৈরি হলে participants দের জানানোর জন্য
    socket.on("create_conversation", (data) => {
        console.log("🆕 New conversation created:", data);
        // সব participants দের new-conversation event পাঠানো
        data.participants.forEach((participantId) => {
            if (participantId !== data.creatorId) {
                socket.to(participantId).emit("new-conversation", data.conversation);
            }
        });
        // Creator কেও confirmation পাঠানো
        socket.emit("conversation_created", data.conversation);
    });
    // Conversation delete হলে participants দের জানানোর জন্য
    socket.on("delete_conversation", (data) => {
        console.log("🗑️ Conversation deleted:", data);
        // সব participants দের conversation-deleted event পাঠানো
        data.participants.forEach((participantId) => {
            socket.to(participantId).emit("conversation-deleted", {
                conversationId: data.conversationId,
                deletedBy: data.deletedBy
            });
        });
    });
    // User একটি conversation এ join করবে
    socket.on("join_conversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`✅ User joined conversation: ${conversationId}`);
    });
    // User join with ID
    socket.on("join_with_id", (userId) => {
        socket.join(userId);
        console.log(`✅ User ${userId} joined their personal room`);
    });
    // Typing indicator
    socket.on("typing", (data) => {
        console.log("👨‍💻 User typing:", data);
        console.log("🎯 Emitting to conversation room:", data.conversationId);
        socket.to(data.conversationId).emit("user_typing", {
            userId: data.userId,
            username: data.username
        });
    });
    socket.on("stop_typing", (data) => {
        console.log("⏹️ User stopped typing:", data);
        console.log("🎯 Emitting to conversation room:", data.conversationId);
        socket.to(data.conversationId).emit("user_stopped_typing", {
            userId: data.userId
        });
    });
    // Disconnect event
    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        // Cleanup করা যেতে পারে যদি প্রয়োজন হয়
        // socket.off("send_message");
        // socket.off("typing");
        // socket.off("create_conversation");
        // socket.off("delete_conversation");
    });
};
// IO instance পাওয়ার জন্য helper function
const getIO = () => {
    if (!io)
        throw new Error("Socket.io not initialized");
    return io;
};
exports.getIO = getIO;
exports.default = chatSocket;
