import { Request, Response } from "express";
import { Group, User } from "../types";
import { GroupModel } from "../model/group";
import { UserModel } from "../model/user";
import { MessageModel } from "../model/message";


export async function createGroup(  
    req: Request<any, any,Group>,
    res: Response) {
  const  {name,description}=req.body
  const adminId=(req as any).user
  try {
    const group=await GroupModel.create({
        name,
        description,
        members:[],
        admin:adminId
      })
      console.log((req as any).user)
      const populatedGroup=await GroupModel.findById(group._id).populate("admin","username email").populate("members","username email")
      res.status(201).json({populatedGroup})
  } catch (error:any) {
    res.status(400).json({message:error.message})

  }


}

export async function getMembershipStatus(
  req: Request<any, any, User, any>,
  res: Response
) {
  try {
    const userId = (req as any).user;
    const groupId = req.params.groupId;

    const group = await GroupModel.findById(groupId);

    if (!group) {
     res.status(404).json({
        success: false,
        message: "Group not found",
      });
      return
    }

    // assuming members is an array of ObjectIds
    const isMember = group.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

     res.status(200).json({
      success: true,
      isMember,
    });
    return
  } catch (error) {
     res.status(500).json({
      success: false,
      message: "Server error",
    });
    return
  }
}
export async function findGroups(req:Request,res:Response) {
  try {
    const currentUser=(req as any).user
    const groups = await GroupModel
    .find({ 
      $or: [
        { members: { $in: [currentUser] } },
        { admin: currentUser }
      ]
    })
    .sort({ createdAt: -1 });
    if (!groups || groups.length===0) {
      res.status(404).json({message:"no group found"})
      return
    }
    res.status(201).json(groups)

  } catch (error:any) {
    res.status(400).json({message:error.message})
return
  }

}

export async function addMemberToGroup( 
  req: Request<any, any, User, any>,
  res: Response
) {
  const groupId = req.params.groupId;
  const memberId = req.body.id;
  const currentUser = (req as any).user;
  
  console.log('Member ID to add:', memberId);
  
  try {
    // ✅ Check if current user is admin of THIS SPECIFIC group
    const isAdmin = await (GroupModel as any).isUserAdmin(currentUser, groupId);
    
    if (!isAdmin) {
      res.status(401).json({ message: "Only admins can add a member" });
      return;
    }

    // Check if group exists
    const group = await GroupModel.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }
    
    // Check if member exists
    const member = await UserModel.findById(memberId);
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }
    
    // ✅ Check if member is already in THIS SPECIFIC group
    const isAlreadyMember = await (GroupModel as any).isMember(memberId, groupId);
    console.log('Is already member:', isAlreadyMember);
    
    if (isAlreadyMember) {
      res.status(409).json({ message: "Member already in group" });
      return;
    }
    
    // ✅ Pass just the member ID, not the whole object
    const updatedGroup = await GroupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: memberId } }, // Use memberId, not member
      { new: true }
    ).populate("members", "_id username email");
    
    res.status(201).json({ updatedGroup });
    
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: "Server error" });
  }
}


export async function joinGroup( 
  req: Request<any, any, User, any>,
  res: Response
) {
  const groupId = req.params.groupId;
  const currentUser = (req as any).user;
  
  
  try {
    const isAdmin = await (GroupModel as any).isUserAdmin(currentUser, groupId);
    console.log({isAdmin})
    if (isAdmin) {
      res.status(401).json({ message: "admin cannot join his own group" });
      return;
    }

    // Check if group exists
    const group = await GroupModel.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }
    
    // Check if member exists
    const member = await UserModel.findById(currentUser);
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }
    
    // ✅ Check if member is already in THIS SPECIFIC group
    const isAlreadyMember = await (GroupModel as any).isMember(currentUser, groupId);
    console.log('Is already member:', isAlreadyMember);
    
    if (isAlreadyMember) {
      res.status(409).json({ message: "Member already in group" });
      return;
    }
    
    const updatedGroup = await GroupModel.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: currentUser } }, 
      { new: true }
    ).populate("members", "_id username email");
    
    res.status(201).json({ updatedGroup });
    
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function leaveGroup( 
  req: Request<any, any,User,any>,
  res: Response) {
  const groupId=req.params.groupId
 try {
  const group=await GroupModel.findById(groupId)
const member=await UserModel.findById(req.body.id)
console.log(!member)
  if (!group) {
    res.status(404).json({message:"group not found"})
    return
  }
  if (!member) {
    res.status(404).json({message:"member not found"})
return
  }


  const updatedGroup = await GroupModel.findByIdAndUpdate(
    groupId,
    { $pull: { members: member } }  )
  .populate("members", "_id");
  
  
  res.status(201).json({updatedGroup})
} catch (error) {
  res.status(404).json({message:"member not found"})

 }
}



export async function findMembersOfGroup(
  req: Request<{ groupId: string }>, 
  res: Response
) {
  const { groupId } = req.params;

  try {
    
    const group = await GroupModel.findById(groupId)
      .populate("admin", "username email") 
      .populate("members", "username email"); 

    if (!group) {
       res.status(404).json({ message: "Group not found" });
       return
    }

    // Return the specific data you want
    res.status(200).json({ group });
    
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteallGroups(
  req: Request, 
  res: Response
) {
  try {
    const deletedGroups=await GroupModel.deleteMany()
res.json({
  message:"groups are removed"
})
  } catch (error:any) {
    res.status(500).json({ message: error.message });

  }
}


export async function deleteGroup(
  req: Request<{ groupId: string }>, 
  res: Response
) {
  try {
    const { groupId } = req.params;

    if (!groupId) {
   res.status(400).json({ message: "Group ID is required" });
   return
    }

    const deletedGroup = await GroupModel.deleteOne({ _id: groupId });

    if (deletedGroup.deletedCount === 0) {
      res.status(404).json({ message: "Group not found" });
      return
    }

    // 5. Send success response
    res.json({
      message: "Group removed successfully",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}


export async function getMessagesInGroup(
  req: Request<any, any, any,any>,
  res: Response
) {
  try {
    const groupId=req.params.groupId
   const groupMessages=await MessageModel.find({groupId}).populate("sender","username email").sort({createdAt:1});
   if (!groupMessages || groupMessages.length===0) {
    res.status(404).json({message:"no message found"})
    return
   }
     res.status(201).json(groupMessages);
     return
  } catch (error) {
    console.error("Find users error:", error);
     res.status(500).json({ message: "Server error" });
  }
}