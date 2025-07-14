"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
// config/socket.ts
const socket_io_1 = require("socket.io");
const chat_socket_1 = __importDefault(require("../sockets/chat.socket"));
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
        },
    });
    io.on("connection", (socket) => {
        console.log("🟢 New user connected:", socket.id);
        (0, chat_socket_1.default)(socket, io); // 🧠 Chat ইভেন্ট হ্যান্ডলার এখানেই call হয়
    });
};
exports.initSocket = initSocket;
