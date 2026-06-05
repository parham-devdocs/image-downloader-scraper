import { Request, Response } from "express";
import { UserModel } from "../model/user";
import { Message } from "../types";
import { GroupModel } from "../model/group";
import { MessageModel } from "../model/message";
import mongoose from "mongoose";
import { ChatSchema } from "../model/chat";
import { AttachmentModel } from "../model/attachment";


export async function sendMessageToGroup(
  req: Request<any, any, any, any>,
  res: Response
) {
  try {
    const currentUser=(req as any).user
    const {content,groupId}=req.body

    const group=await GroupModel.findById(groupId)
    if (!group) {
      res.status(404).json({message:"group does not exist"})
    return
    }

if (!currentUser) {
  res.status(404).json({message:"user does not exist"})
return
}
if (!content) {
  res.status(404).json({message:"content does not exist"})
return
}

const isMember=  await GroupModel.findOne({ 
  _id: groupId, 
  members: { $in: [currentUser] } 
});
console.log({currentUser,groupId,isMember})
if (!isMember) {
  res.status(404).json({message:"user is not a member"})
return
}
    const newMessage = await MessageModel.create({
        sender:currentUser,
        content,
    })
    const updatedGroup = await GroupModel.updateOne(
      { _id: groupId },  
      { 
        $push: { messages: newMessage._id },
        $set: { lastMessage: newMessage._id } ,

      }
    );
     res.status(201).json(updatedGroup);
  } catch (error) {
    console.error("Find users error:", error);
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
const updatedChat = await ChatSchema.updateOne(
  { _id: chatId },  
  { 
    $push: { messages: newMessage._id },
    $set: { lastMessage: newMessage._id }  
  }
);
res.status(201).json(updatedChat);
  } catch (error) {
    console.error("Find users error:", error);
     res.status(500).json({ message: "Server error" });
  }
}




export async function DeleteMessages(
  req: Request,
  res: Response
) {
  try {
    const { messageId}  = req.body;

    // 1. Find the message first (to check existence or ownership)
    const message = await MessageModel.findById(messageId);

    if (!message) {
       res.status(404).json({ message: "Message not found" });
       return
    }

    // 2. Perform the deletion
    await MessageModel.findByIdAndDelete(messageId);

    // 3. Return a success response
    // Using 200 (OK) or 204 (No Content) is standard for deletions
     res.status(200).json({ 
      message: "Message deleted successfully",
      deletedId: messageId 
    });
return
  } catch (error) {
    console.error("Delete message error:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
}


export async function markChatMessageAsRead (
  req: Request,
  res: Response
) {
  try {
    const { messageId } = req.body;

    // 1. Find the message first (to check existence or ownership)
    const message = await MessageModel.findById(messageId);

    if (!message) {
       res.status(404).json({ message: "Message not found" });
       return
    }

    // 2. Perform the deletion
    await MessageModel.findByIdAndUpdate(messageId,{seen:true});

    // 3. Return a success response
    // Using 200 (OK) or 204 (No Content) is standard for deletions
     res.status(200).json({ 
      message: "Message read successfully",
      updatedId: messageId 
    });
return
  } catch (error) {
    console.error("Delete message error:", error);
     res.status(500).json({ message: "Server error" });
     return
  }
}



export async function sendDocumentInGroup(
  req: Request<any, any, any, any>,
  res: Response
) {
  try {
    const currentUser = (req as any).user;
    const { file } = req;
    const { groupId } = req.params;

    const group = await GroupModel.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "group does not exist" });
      return;
    }

    if (!currentUser) {
      res.status(404).json({ message: "user does not exist" });
      return;
    }

    const isMember = await GroupModel.findOne({ 
      _id: groupId, 
      members: { $in: [currentUser] } 
    });
    
    if (!isMember) {
      res.status(404).json({ message: "user is not a member" });
      return;
    }

    // ✅ Determine message type based on MIME type
    let messageType = 'file'; // default
    
    if (file?.mimetype?.startsWith('audio/')) {
      messageType = 'voice';
    } 

    const newFile = await AttachmentModel.create({
      filename: file?.filename,
      originalName: file?.originalname,
      mimeType: file?.mimetype,
      size: file?.size,
      url: `/uploads/${file?.filename}`,
    });

    const newMessage = await MessageModel.create({
      sender: currentUser,
      fileId: newFile._id,
      type: messageType // ✅ Dynamic type based on file
    });

    const updatedGroup = await GroupModel.updateOne(
      { _id: groupId },  
      { 
        $push: { messages: newMessage._id },
        $set: { lastMessage: newMessage._id }
      }
    );
    
    res.status(201).json(updatedGroup);
    
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
}