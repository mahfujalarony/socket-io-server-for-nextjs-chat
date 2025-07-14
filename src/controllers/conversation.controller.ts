import { Request, Response } from "express";
import Conversation, { IConversation } from "../models/Conversation";
import User, { IUser } from "../models/User";
import { getIO } from "../sockets/chat.socket";

// Request body type
interface CreateConversationBody {
  participants: string[];
  type: 'direct' | 'group';
  groupName?: string;
  groupAvatar?: string;
}

// Request parameters type
interface FirebaseUidParams {
  firebaseUid: string;
}

interface DeleteConvParams {
  firebaseUid: string;
  chatId: string;
}

export const createConversation = async (req: Request<{}, {}, CreateConversationBody>, res: Response) => {
  try {
    const { participants, type, groupName, groupAvatar } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ message: "At least 2 participants are required." });
    }
    
    // Remove duplicate participants
    const uniqueParticipants = [...new Set(participants.map(p => p.toString()))];

    if (type === "direct") {
      if (uniqueParticipants.length !== 2) {
        return res.status(400).json({ message: "Direct chat must have exactly 2 participants." });
      }
      
      // Check for existing conversation with these participants
      const sortedParticipants = [...uniqueParticipants].sort();
      const existing: IConversation | null = await Conversation.findOne({
        type: "direct",
        participants: { $all: sortedParticipants, $size: 2 }
      });

      if (existing) {
        return res.status(200).json({ message: "Conversation already exists.", data: existing });
      }
    } else if (type === "group" && (!groupName || groupName.trim() === "")) {
      return res.status(400).json({ message: "Group name is required for group chats." });
    }

    const newConversation = new Conversation({
      participants: uniqueParticipants,
      type,
      groupName: type === "group" ? groupName : null,
      groupAvatar: type === "group" ? groupAvatar : null,
    });

    await newConversation.save();

    // Notify all participants via socket
    const io = getIO();
    participants.forEach((userId) => {
      io.to(userId.toString()).emit("new-conversation", newConversation);
    });

    const populatedConversation = await Conversation.findById(newConversation._id)
        .populate<{ participants: IUser[] }>('participants', 'username avatar firebaseUid isOnline _id');

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully.",
      data: populatedConversation,
    });

  } catch (err) {
    console.error("Conversation create error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

export const getConvList = async (req: Request<FirebaseUidParams>, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    const user: IUser | null = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const conversations = await Conversation.find({ participants: user._id })
      .populate<{ participants: IUser[] }>('participants', 'username avatar firebaseUid isOnline _id')
      .sort({ updatedAt: -1 })
      .lean<IConversation[]>();

    res.status(200).json({ success: true, data: conversations });
  } catch (err) {
    console.error("Get conversation list error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const deleteConversation = async (req: Request<DeleteConvParams>, res: Response) => {
  try {
    const { firebaseUid, chatId } = req.params;
    const user: IUser | null = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Get conversation data before deletion to notify participants
    const conversation: IConversation | null = await Conversation.findOne({
      _id: chatId,
      participants: user._id,
    }).populate<{ participants: IUser[] }>('participants', '_id');

    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: "Conversation not found or you don't have permission." 
      });
    }

    await Conversation.findByIdAndDelete(chatId);

    // Notify other participants via socket
    const io = getIO();
    const participantIds = conversation.participants.map((p: any) => p._id.toString());
    
    participantIds.forEach((participantId: string) => {
      if (participantId !== (user._id as any).toString()) {
        io.to(participantId).emit("conversation-deleted", {
          conversationId: chatId,
          deletedBy: (user._id as any).toString()
        });
      }
    });

    res.status(200).json({ success: true, message: "Conversation deleted successfully." });
  } catch (err) {
    console.error("Delete conversation error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    console.log("🔍 Getting conversation by ID:", conversationId);

    // Validate conversationId format
    if (!conversationId || conversationId.length !== 24) {
      console.log("❌ Invalid conversation ID format:", conversationId);
      return res.status(400).json({ success: false, message: "Invalid conversation ID format." });
    }

    const conversation = await Conversation.findById(conversationId)
      .populate<{ participants: IUser[] }>('participants', 'username avatar firebaseUid isOnline _id');

    console.log("🔍 Database query result:", conversation ? "Found" : "Not found");

    if (!conversation) {
      console.log("❌ Conversation not found in database");
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    console.log("✅ Conversation found, returning data");
    res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    console.error("❌ Get conversation by ID error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};