import { Request, Response } from 'express';

import mongoose from 'mongoose';
import { ChatSchema } from '../model/chat';
import { GroupModel } from '../model/group';

export async function getConversationMetaData(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params; // Get conversation ID from URL params
        const currentUserId = (req as any).user?._id; // Assuming you have auth middleware
        
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
         res.status(400).json({ error: "Invalid conversation ID" });
         return
        }

        // First, check if it's a private chat (Chat collection)
        const privateChat = await ChatSchema.findById(id)
            .populate('members', 'username email attachment') // Populate member details
            .lean();

        if (privateChat) {
            // It's a private conversation
            const otherMember = privateChat.members.find(
                (member: any) => member._id.toString() !== currentUserId?.toString()
            );

             res.status(200).json({
                type: 'private',
                metadata: {
                    chatId: privateChat._id,
                    otherParticipant: otherMember ? {
                        _id: otherMember._id,
                        username: otherMember.username,
                        email: otherMember.email,
                        avatar: otherMember.attachment || null
                    } : null,
                    members: privateChat.members,
                    createdAt: privateChat.createdAt,
                    updatedAt: privateChat.updatedAt
                }
            });
            return
        }

        // If not private chat, check if it's a group
        const groupChat = await GroupModel.findById(id)
            .populate('admin', 'username email attachment')
            .populate('members', 'username email attachment')
            .lean();
console.log(groupChat)
        if (groupChat) {
            // It's a group conversation
             res.status(200).json({
                type: 'group',
                metadata: {
                    groupId: groupChat._id,
                    name: groupChat.name,
                    description: groupChat.description,
                    avatarURL: groupChat.avatarURL,
                    admin: groupChat.admin,
                    members: groupChat.members.length,
                    memberCount: groupChat.members.length
                 
                }
            });
            return
        }

        // If neither found
         res.status(404).json({ error: "Conversation not found" });
         return

    } catch (error) {
        console.error("Error fetching conversation metadata:", error);
         res.status(500).json({ error: "Internal server error" });
         return
    }
}