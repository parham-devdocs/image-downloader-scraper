import { Request, Response } from "express";
import { UserModel } from "../model/user";
import { ChatSchema } from "../model/chat";
import { decodeJWT } from "../util/jwt";
import { io } from "../socket-server";
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
        groupId:null,
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
  req: Request<any, any, any,any>,
  res: Response
) {
  try {
    const chatId=req.params.chatId
    console.log(chatId)
   const chatMessages=await MessageModel.find({chatId}).populate("sender","username email").sort({createdAt:1});
   if (!chatMessages || chatMessages.length===0) {
    res.status(404).json({message:"no chat found"})
    return
   }
     res.status(201).json(chatMessages);
     return
  } catch (error) {
    console.error("Find users error:", error);
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
    });
        res.json({ message: "Rooms retrieved", userChats});
  } catch (error) {
    console.error("❌ [ChatList] Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
