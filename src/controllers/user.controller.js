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
exports.getMongoId = exports.getAllUsers = exports.getUser = void 0;
const User_1 = __importDefault(require("../models/User"));
// একক ইউজার (firebaseUid দিয়ে)
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firebaseUid = req.params.id;
        const user = yield User_1.default.findOne({ firebaseUid })
            .select('username email isOnline avatar firebaseUid')
            .lean();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Error in getUser:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error
        });
    }
});
exports.getUser = getUser;
// সব ইউজার (কন্টাক্ট লিস্ট)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const firebaseUid = req.params.firebaseUid;
    try {
        const users = yield User_1.default.find({ firebaseUid: { $ne: firebaseUid } }) // Exclude current user
            .sort({ username: 1 })
            .select('username email isOnline avatar firebaseUid')
            .lean();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }
    catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error
        });
    }
});
exports.getAllUsers = getAllUsers;
// MongoDB ObjectId (firebaseUid দিয়ে)
const getMongoId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firebaseUid } = req.params;
        console.log("🔍 Getting MongoDB ID for firebaseUid:", firebaseUid);
        const user = yield User_1.default.findOne({ firebaseUid }).select('_id').lean();
        console.log("🔍 Database query result:", user ? "Found" : "Not found");
        if (!user) {
            console.log("❌ User not found in database");
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        console.log("✅ User found, returning MongoDB ID");
        res.status(200).json({
            success: true,
            data: { mongoId: user._id }
        });
    }
    catch (error) {
        console.error('❌ Error in getMongoId:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error
        });
    }
});
exports.getMongoId = getMongoId;
