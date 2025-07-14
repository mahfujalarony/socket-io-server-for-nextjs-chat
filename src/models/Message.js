"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'contact'],
        default: 'text'
    },
    attachments: [{
            fileId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'FileUpload'
            },
            fileName: String,
            fileType: String,
            fileSize: Number,
            fileUrl: String
        }],
    fileUrl: {
        type: String,
        default: null
    },
    replyTo: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    mentions: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    reactions: [{
            userId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            emoji: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports.Message = Message;
exports.default = Message;
