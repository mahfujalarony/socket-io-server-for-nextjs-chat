import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import chatSocket from "../sockets/chat.socket";

export const initSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // production এ নির্দিষ্ট domain set করো
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New user connected:", socket.id);
    chatSocket(socket, io); // Custom chat events
  });
};
