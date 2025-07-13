import { Request, Response } from "express";
import Message, { IMessage } from '../models/Message';
import Conversation, { IConversation } from '../models/Conversation';
import User, { IUser } from '../models/User';
import { getIO } from '../sockets/chat.socket';

// Message save করার জন্য socket এ ব্যবহার হবে
export const saveMessage = async (data: any) => {
  const { conversationId, senderId, content, messageType = 'text' } = data;

  try {
    const message = await Message.create({
      conversationId,
      sender: senderId,
      content,
      messageType,
      timestamp: new Date(),
    });

    // Conversation এর lastMessage update করা
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastActivity: new Date()
    });

    // Message populate করা
    const populatedMessage = await Message.findById(message._id)
      .populate<{ sender: IUser }>('sender', 'username avatar firebaseUid _id');

    return populatedMessage;
  } catch (error) {
    console.error("Save message error:", error);
    throw error;
  }
};

// HTTP route এর জন্য message send করা
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, content, messageType = 'text' } = req.body;

    if (!conversationId || !senderId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "ConversationId, senderId এবং content আবশ্যক।" 
      });
    }

    // Message save করা
    const message = await saveMessage({ conversationId, senderId, content, messageType });

    // Real-time এ participants দের পাঠানো
    const conversation = await Conversation.findById(conversationId)
      .populate<{ participants: IUser[] }>('participants', '_id');

    if (conversation) {
      const io = getIO();
      conversation.participants.forEach((participant: any) => {
        if (participant._id.toString() !== senderId) {
          io.to(participant._id.toString()).emit("new-message", {
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

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversationId })
      .populate<{ sender: IUser }>('sender', 'username avatar firebaseUid _id')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean<IMessage[]>();

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
    const { userId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: "Message খুঁজে পাওয়া যায়নি।" 
      });
    }

    // শুধু sender নিজের message delete করতে পারবে
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "আপনি শুধু নিজের message delete করতে পারেন।" 
      });
    }

    await Message.findByIdAndDelete(messageId);

    // Real-time এ participants দের জানানো
    const conversation = await Conversation.findById(message.conversationId)
      .populate<{ participants: IUser[] }>('participants', '_id');

    if (conversation) {
      const io = getIO();
      conversation.participants.forEach((participant: any) => {
        io.to(participant._id.toString()).emit("message-deleted", {
          messageId,
          conversationId: message.conversationId
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
