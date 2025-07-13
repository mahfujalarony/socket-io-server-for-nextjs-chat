import { Request, Response } from "express";
import Conversation, { IConversation } from "../models/Conversation";
import User, { IUser } from "../models/User";
import { getIO } from "../sockets/chat.socket";

// রিকোয়েস্ট বডির জন্য টাইপ
interface CreateConversationBody {
  participants: string[];
  type: 'direct' | 'group';
  groupName?: string;
  groupAvatar?: string;
}

// রিকোয়েস্ট প্যারামিটারের জন্য টাইপ
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
      return res.status(400).json({ message: "কমপক্ষে ২ জন অংশগ্রহণকারী প্রয়োজন।" });
    }
    
    const uniqueParticipants = [...new Set(participants.map(p => p.toString()))];

    if (type === "direct") {
      if (uniqueParticipants.length !== 2) {
        return res.status(400).json({ message: "ডাইরেক্ট চ্যাটে ঠিক ২ জন অংশগ্রহণকারী থাকতে হবে।" });
      }
      
      const sortedParticipants = [...uniqueParticipants].sort();

      const existing: IConversation | null = await Conversation.findOne({
        type: "direct",
        participants: { $all: sortedParticipants, $size: 2 }
      });

      if (existing) {
        return res.status(200).json({ message: "এই কনভার্সেশনটি আগে থেকেই আছে।", data: existing });
      }
    } else if (type === "group" && (!groupName || groupName.trim() === "")) {
      return res.status(400).json({ message: "গ্রুপ চ্যাটের জন্য গ্রুপের নাম আবশ্যক।" });
    }

    const newConversation = new Conversation({
      participants: uniqueParticipants,
      type,
      groupName: type === "group" ? groupName : null,
      groupAvatar: type === "group" ? groupAvatar : null,
    });

    await newConversation.save();

    const io = getIO();
    participants.forEach((userId) => {
      io.to(userId.toString()).emit("new-conversation", newConversation);
    });

    const populatedConversation = await Conversation.findById(newConversation._id)
        .populate<{ participants: IUser[] }>('participants', 'username avatar firebaseUid isOnline _id');

    return res.status(201).json({
      success: true,
      message: "কনভার্সেশন সফলভাবে তৈরি হয়েছে।",
      data: populatedConversation,
    });

  } catch (err) {
    console.error("Conversation create error:", err);
    res.status(500).json({ success: false, message: "সার্ভার এরর। আবার চেষ্টা করুন।" });
  }
};

export const getConvList = async (req: Request<FirebaseUidParams>, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    const user: IUser | null = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: "ইউজার খুঁজে পাওয়া যায়নি।" });
    }

    const conversations = await Conversation.find({ participants: user._id })
      .populate<{ participants: IUser[] }>('participants', 'username avatar firebaseUid isOnline _id')
      .sort({ updatedAt: -1 })
      .lean<IConversation[]>();

    res.status(200).json({ success: true, data: conversations });
  } catch (err) {
    console.error("Get Conv List error:", err);
    res.status(500).json({ success: false, message: "সার্ভার এরর।" });
  }
};

export const deleteConversation = async (req: Request<DeleteConvParams>, res: Response) => {
  try {
    const { firebaseUid, chatId } = req.params;
    const user: IUser | null = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: "ইউজার খুঁজে পাওয়া যায়নি।" });
    }

    // Delete করার আগে conversation data নেওয়া যাতে participants দের জানানো যায়
    const conversation: IConversation | null = await Conversation.findOne({
      _id: chatId,
      participants: user._id,
    }).populate<{ participants: IUser[] }>('participants', '_id');

    if (!conversation) {
      return res.status(404).json({ success: false, message: "কনভার্সেশন খুঁজে পাওয়া যায়নি বা আপনার অনুমতি নেই।" });
    }

    // Delete the conversation
    await Conversation.findByIdAndDelete(chatId);

    // Socket event emit করে অন্য participants দের জানানো
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

    res.status(200).json({ success: true, message: "কনভার্সেশন সফলভাবে মুছে ফেলা হয়েছে।" });
  } catch (err) {
    console.error("Delete conversation error:", err);
    res.status(500).json({ success: false, message: "সার্ভার এরর।" });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate<{ participants: IUser[] }>('participants', 'username avatar firebaseUid isOnline _id');

    if (!conversation) {
      return res.status(404).json({ success: false, message: "কনভার্সেশন খুঁজে পাওয়া যায়নি।" });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    console.error("Get conversation by ID error:", err);
    res.status(500).json({ success: false, message: "সার্ভার এরর।" });
  }
};