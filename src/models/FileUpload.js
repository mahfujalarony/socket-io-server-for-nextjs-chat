"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fileUploadSchema = new mongoose_1.default.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messageId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    thumbnailUrl: {
        type: String,
        default: null
    },
    duration: {
        type: Number,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const FileUpload = mongoose_1.default.model('FileUpload', fileUploadSchema);
exports.default = FileUpload;
