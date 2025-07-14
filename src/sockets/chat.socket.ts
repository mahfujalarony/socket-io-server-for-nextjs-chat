// sockets/chat.socket.ts
import { Server, Socket } from "socket.io";

let io: Server;

// Chat events handle করার জন্য function
const chatSocket = (socket: Socket, ioInstance: Server) => {
  // Global io reference save করা
  io = ioInstance;
  
  console.log("🔗 Chat socket handler activated for:", socket.id);

  // User একটি room এ join করবে
  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`✅ User ${userId} joined their room`);
  });

  // Private message পাঠানোর জন্য
  socket.on("send_message", async (data: any) => {
    console.log("📨 Message received:", data);
    
    try {
      // Message save করা database এ
      const { saveMessage } = await import("../controllers/message.controller");
      const savedMessage = await saveMessage({
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
      data.participants?.forEach((participantId: string) => {
        if (participantId !== data.senderId) {
          socket.to(participantId).emit("new_message", {
            message: savedMessage,
            conversationId: data.conversationId
          });
        }
      });

    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("message_error", {
        success: false,
        error: "Message পাঠাতে সমস্যা হয়েছে।"
      });
    }
  });

  // New conversation তৈরি হলে participants দের জানানোর জন্য
  socket.on("create_conversation", (data: any) => {
    console.log("🆕 New conversation created:", data);
    
    // সব participants দের new-conversation event পাঠানো
    data.participants.forEach((participantId: string) => {
      if (participantId !== data.creatorId) {
        socket.to(participantId).emit("new-conversation", data.conversation);
      }
    });
    
    // Creator কেও confirmation পাঠানো
    socket.emit("conversation_created", data.conversation);
  });

  // Conversation delete হলে participants দের জানানোর জন্য
  socket.on("delete_conversation", (data: any) => {
    console.log("🗑️ Conversation deleted:", data);
    
    // সব participants দের conversation-deleted event পাঠানো
    data.participants.forEach((participantId: string) => {
      socket.to(participantId).emit("conversation-deleted", {
        conversationId: data.conversationId,
        deletedBy: data.deletedBy
      });
    });
  });

  // User একটি conversation এ join করবে
  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`✅ User joined conversation: ${conversationId}`);
  });

  // User join with ID
  socket.on("join_with_id", (userId: string) => {
    socket.join(userId);
    console.log(`✅ User ${userId} joined their personal room`);
  });

  // Typing indicator
  socket.on("typing", (data: { conversationId: string, userId: string, username: string }) => {
    console.log("👨‍💻 User typing:", data);
    console.log("🎯 Emitting to conversation room:", data.conversationId);
    socket.to(data.conversationId).emit("user_typing", {
      userId: data.userId,
      username: data.username
    });
  });

  socket.on("stop_typing", (data: { conversationId: string, userId: string }) => {
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
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export default chatSocket;
