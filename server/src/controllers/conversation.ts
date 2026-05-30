import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ChatSchema } from '../model/chat';
import { GroupModel } from '../model/group';

export async function getConversationMetaData(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params;
        const currentUserId = (req as any).user?._id;
        
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid conversation ID" });
            return;
        }

        // Check if it's a private chat (Chat collection)
        const privateChat = await ChatSchema.findById(id)
            .populate('members', 'username email attachment')
            .lean();
            
        if (privateChat) {
            // Find the other member (not the current user)
            const otherMember = privateChat.members.find(
                (member: any) => member._id.toString() !== currentUserId?.toString()
            );
            
            res.status(200).json({
                type: 'private',
                metadata: {
                    id: privateChat._id,
                    name: otherMember?.username || 'Unknown User',
                    avatarURL: otherMember?.attachment?.url || null,
                    
                    createdAt: privateChat.createdAt,
                    updatedAt: privateChat.updatedAt
                }
            });
            return;
        }

        // Check if it's a group
        const groupChat = await GroupModel.findById(id)
            .populate('admin', 'username email attachment')
            .populate('members', 'username email attachment')
            .lean();
            
        console.log({groupChat});
        
        if (groupChat) {
            res.status(200).json({
                type: 'group',
                metadata: {
                    id: groupChat._id,
                    name: groupChat.name,
                    description: groupChat.description,
                    avatarURL: groupChat.avatarURL,
                    admin: groupChat.admin.username,
                    members: groupChat.members,
                    memberCount: groupChat.members.length
                }
            });
            return;
        }

        // If neither found
        res.status(404).json({ error: "Conversation not found" });
        return;

    } catch (error) {
        console.error("Error fetching conversation metadata:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
}