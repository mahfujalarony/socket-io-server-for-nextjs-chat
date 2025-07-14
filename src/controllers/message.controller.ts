import { Request, Response } from "express";
import Message, { IMessage } from '../models/Message';
import Conversation, { IConversation } from '../models/Conversation';
import User, { IUser } from '../models/User';
import { getIO } from '../sockets/chat.socket';

// Message save করার জন্য socket এ ব্যবহার হবে
export const saveMessage = async (data: any) => {
  const { conversationId, senderId, content, messageType = 'text', fileUrl } = data;
  console.log("Saving message:", { conversationId, senderId, content, messageType, fileUrl });

  try {
    const message = await Message.create({
      conversationId,
      sender: senderId,
      content,
      messageType,
      fileUrl,
      timestamp: new Date(),
    });



    // Conversation এর lastMessage update করা
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastActivity: new Date()
    });

    // Message populate করা
    const populatedMessage = await Message.findById(message._id)
      .populate<{ sender: IUser }>('sender', 'username avatar firebaseUid fileUrl _id');

    return populatedMessage;
  } catch (error) {
    console.error("Save message error:", error);
    throw error;
  }
};

// HTTP route এর জন্য message send করা
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, content, messageType = 'text', fileUrl } = req.body;

    if (!conversationId || !senderId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "ConversationId, senderId এবং content আবশ্যক।" 
      });
    }

    // Message save করা
    const message = await saveMessage({ conversationId, senderId, content, messageType, fileUrl });

    // Real-time এ participants দের পাঠানো
    const conversation = await Conversation.findById(conversationId)
      .populate<{ participants: IUser[] }>('participants', '_id');

    if (conversation) {
      const io = getIO();
      console.log("📡 Emitting new message to participants");
      
      // Conversation room এ emit করি
      io.to(conversationId).emit("new_message", {
        message,
        conversationId
      });
      
      // Individual user rooms এও emit করি (backup)
      conversation.participants.forEach((participant: any) => {
        if (participant._id.toString() !== senderId) {
          console.log(`📤 Sending to user: ${participant._id.toString()}`);
          io.to(participant._id.toString()).emit("new_message", {
            message,
            conversationId
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Message সফলভাবে পাঠানো হয়েছে।",
      data: message
    });

  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Message পাঠাতে সমস্যা হয়েছে।" 
    });
  }
};

// Conversation এর সব messages get করা
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log("🔍 Getting messages for conversation:", conversationId);
    console.log("📄 Pagination:", { page, limit });

    // Validate conversationId format
    if (!conversationId || conversationId.length !== 24) {
      console.log("❌ Invalid conversation ID format:", conversationId);
      return res.status(400).json({ success: false, message: "Invalid conversation ID format." });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversationId })
      .populate<{ sender: IUser }>('sender', 'username avatar firebaseUid _id')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean<IMessage[]>();

    console.log(`📝 Found ${messages.length} messages for conversation`);

    // Messages কে reverse করা যাতে oldest first হয়
    const reversedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      data: reversedMessages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: await Message.countDocuments({ conversationId })
      }
    });

  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Messages load করতে সমস্যা হয়েছে।" 
    });
  }
};

// Message delete করা
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
   // const { userId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: "Message খুঁজে পাওয়া যায়নি।" 
      });
    }



    await Message.findByIdAndDelete(messageId);

    // Real-time এ participants দের জানানো
    const conversation = await Conversation.findById(message.conversationId)
      .populate<{ participants: IUser[] }>('participants', '_id');

    if (conversation) {
      const io = getIO();
      
      // Conversation room এ emit করি
      io.to(message.conversationId.toString()).emit("message_deleted", {
        messageId,
        conversationId: message.conversationId.toString()
      });
      
      // Individual user rooms এও emit করি (backup)
      conversation.participants.forEach((participant: any) => {
        io.to(participant._id.toString()).emit("message_deleted", {
          messageId,
          conversationId: message.conversationId.toString()
        });
      });
    }

    res.status(200).json({
      success: true,
      message: "Message সফলভাবে delete করা হয়েছে।"
    });

  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Message delete করতে সমস্যা হয়েছে।" 
    });
  }
};
