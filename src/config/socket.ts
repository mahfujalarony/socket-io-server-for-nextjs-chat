// config/socket.ts
import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import chatSocket from "../sockets/chat.socket";

export const initSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New user connected:", socket.id);
    chatSocket(socket, io); // 🧠 Chat ইভেন্ট হ্যান্ডলার এখানেই call হয়
  });
};
