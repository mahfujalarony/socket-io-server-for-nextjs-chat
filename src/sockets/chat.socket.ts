import { Server, Socket } from "socket.io";

export default (socket: Socket, io: Server) => {
  socket.on("join", (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("message", ({ roomId, message }) => {
    io.to(roomId).emit("message", { message, sender: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
};
