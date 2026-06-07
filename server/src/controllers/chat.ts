import { Request, Response } from "express";
import { UserModel } from "../model/user";
import { ChatSchema } from "../model/chat";
import { io } from "../socket-server";
import { AttachmentModel } from "../model/attachment";
import { MessageModel } from "../model/message";

interface MyQuery {
  targetUser: string;
}

export async function JoinChatRoom(
  req: Request<any, any, any, MyQuery>,
  res: Response
) {
  try {
  

    const targetUserId = req.params.userId;
    console.log(`Target User ID from params: ${targetUserId}`);
    
    if (!targetUserId) {
      console.log("❌ Validation Failed: targetUserId missing");
      res.status(400).json({ message: "targetUser is required" });
      return;
    }
   const user=(req as any).user
    const currentUser = await UserModel.findOne({_id:user });

    if (!currentUser) {
      res.status(404).json({ message: "client not found" });
      return;
    }

    const targetUser = await UserModel.findOne({ _id: targetUserId });
    if (!targetUser) {
      res.status(404).json({ message: "target user not found" });
      return;
    }


    console.log("--- [JoinChatRoom] Stage 3: Chat Room Check ---");
    let chat = await (ChatSchema as any).findDirectChat(currentUser._id, targetUser._id);
    console.log({chat})
    if (chat) {
      console.log(`✅ Existing chat room found: ${chat._id}`);

    } else {
      console.log("⚠️ No existing chat, creating new one...");
      console.log(targetUser._id,currentUser._id)
      chat = new ChatSchema({
        members: [targetUser._id,currentUser._id],
        isGroup: false,
        lastMessage: "Started a new conversation",
        name: "Private Chat"
      });
  
      await chat.save();
      console.log(`✅ New chat room created: `);
    }

    res.json({
      message: "Chat room ready",
      chat
    });
  } catch (error) {
    console.error("❌ [JoinChatRoom] Critical Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function getMessagesInChat(
  req: Request<any, any, any, any>,
  res: Response
) {
  try {
    const chatId = req.params.chatId

    const chat = await ChatSchema.findById(chatId)
      .select("messages")
      .populate({
        path: 'messages',
        populate: [
          {
            path: 'sender',
            model: 'User',
            select: "username isAdmin avatar" // Added avatar for better UI
          },
          {
            path: 'file',
            model: 'Attachment',
          }
        ]
      })
      .exec();
    
    if (!chat || chat.messages.length === 0) {
      res.status(200).json({ messages: [] }) // Changed to 200 and consistent response structure
      return
    }
    
    res.status(200).json(chat); // Changed to 200 (201 is for creation)
    return
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
}







export async function ChatList(
  req: Request<any, any, any, any>,
  res: Response
) {
  try {
   
   const user=(req as any).user
    const currentUser = await UserModel.findOne({_id:user });

    if (!currentUser) {
      res.status(404).json({ message: "client not found" });
      return;
    }

  
    console.log("--- [ChatList] Stage 3: Inspecting Socket.io Rooms ---");
    const rooms = io.sockets.adapter.rooms;
    console.log(rooms)
    // We iterate through the Map to log every room clearly
    console.log(`Total rooms active on server: ${rooms.size}`);
    
    rooms.forEach((socketIds, roomName) => {
        // This makes it easy to spot your Chat IDs vs User IDs
        const isUserRoom = roomName.startsWith("user_");
        const type = isUserRoom ? "USER ROOM" : "CHAT ROOM";
        
        console.log(`> [${type}] Room ID: ${roomName} | Members Count: ${socketIds.size}`);
        console.log(`    Socket IDs in room: ${Array.from(socketIds).join(", ")}`);
    });

    // Send a clean object to the client so JSON.stringify doesn't fail
    const roomsObject = Object.fromEntries(
        Array.from(rooms.entries()).map(([room, sockets]) => [room, Array.from(sockets)])
    );

    const userChats = await ChatSchema.find({ 
      members: { $in: [currentUser._id] } 
    }).populate({
      path: "messages",
      select: "seen sender",
      match: { 
        seen: false,
        sender: { $ne: currentUser._id }  // Not sent by current user
      }
    });
    
    
    const chatsWithUnreadCount = userChats.map(chat => ({
      ...chat.toObject(),
      unreadCount: chat.messages.length  // Length of populated messages array
    }));
    
    
        res.status(201).json(chatsWithUnreadCount);
  } catch (error) {
    console.error("❌ [ChatList] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}



export async function sendDocumentInChat(
  req: Request<any, any, any, any>,
  res: Response
) {
  try {
    const currentUser = (req as any).user;
    const { file } = req;
    const { chatId } = req.params;
    

    const chat = await ChatSchema.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: "group does not exist" });
      return;
    }

    if (!currentUser) {
      res.status(404).json({ message: "user does not exist" });
      return;
    }

    const isMember = await ChatSchema.findOne({
      _id: chatId,
      members: { $in: [currentUser] },
    });

    if (!isMember) {
      res.status(404).json({ message: "user is not a member" });
      return;
    }
    let folder = 'others';
    
    // Determine folder based on file type
    if (file?.mimetype.startsWith('image/')) {
      folder = 'images';
    } else if (file?.mimetype.startsWith('audio/')) {
      folder = 'voices';  // or 'audio'
    } else if (file?.mimetype === 'application/pdf') {
      folder = 'documents';
    } else if (file?.mimetype.includes('word') || file?.mimetype.includes('document')) {
      folder = 'documents';
    }
    
    // ✅ Determine message type based on MIME type
    let messageType = "file"; // default

    if (file?.mimetype?.startsWith("audio/")) {
      messageType = "voice";
    }

    const newFile = await AttachmentModel.create({
      filename: file?.filename,
      originalName: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size,
      url: `${folder}-${file?.filename}`,
    });
    // ✅ FIXED: Use 'file' instead of 'fileId' to match schema
    const newMessage = await MessageModel.create({
      sender: currentUser,
      file: newFile._id, // Changed from 'fileId' to 'file'
      type: messageType,
    });

    // ✅ FIXED: Properly type the update operation
    const updatedGroup = await ChatSchema.findByIdAndUpdate(
      { _id: chatId },
      {
        $push: { messages: newMessage._id },
        $set: { lastMessage: newMessage._id },
      },
      { new: true } // Returns the updated document
    );

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        group: updatedGroup,
        message: newMessage,
        file: newFile,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
}



export async function sendMessageToChat(
  req: Request<any, any, any, any>,
  res: Response
) {
  try {
    const currentUser=(req as any).user
    const {content,chatId}=req.body

if (!currentUser) {
  res.status(404).json({message:"user does not exist"})
return
}
if (!content) {
  res.status(404).json({message:"content does not exist"})
return
}
const isMember=await (ChatSchema as any).isMember(currentUser,chatId)
console.log({currentUser:currentUser,chatId})
console.log(isMember)
if (!isMember) {
  res.status(404).json({message:"user is not a member"})
return
}
const newMessage = await MessageModel.create({
  sender:currentUser,
  content,
})
const updatedChat = await ChatSchema.findByIdAndUpdate(
  chatId,
  { 
    $push: { messages: newMessage._id },
    $set: { lastMessage: newMessage._id }
  },
  { new: true } 
)

res.status(201).json(updatedChat);
  } catch (error) {
    console.error("Find users error:", error);
     res.status(500).json({ message: "Server error" });
  }
}
