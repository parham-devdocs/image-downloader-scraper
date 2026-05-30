export type RegisterState = {
    success: boolean;
    data?: any;
    error?: {
      email?: string[];
      username?: string[];
      userId?: string[];
      password?: string[];
      general?: string;
    };
  };
  export interface User {
    _id: string;
    username: string;
    userId: string;
    email: string;
    isAdmin: boolean;
    password?: string; // Optional because you might omit this in other API calls
    refreshToken: string;
    createdAt: string; // Or Date if you parse it
    updatedAt: string;
    attachment?:Attachment[]
    __v: number;
  }
  export interface MembershipStatus{
    
    success: boolean,
    isMember: boolean
  
}
  export interface LoginResponse {
    message: string;
    accessToken: string;
    user: User;
  }
  
  export type ChatItemType={
    name:string
    avatarURL?:string
    lastMessage?:string
    unreadCount?:number
    userId:string
  }


export type Attachment={
  filename?:string,
  originalName?:string,
  mimeType?:string,
  size?:number,
  url?:string
  
}
  
  export type Message={
    _id:string
    content:string

    sender: User
    imageAvatarURL?:Attachment
    seen:boolean
    createdAt: string

  
  }

  export type PresenceStatus = "online" | "last_seen_recently" | "offline";
  export type ActivityStatus = "typing" | "idle";
  
  export type UserStatus = {
    username: string;
    presence: PresenceStatus;
    activity?: ActivityStatus; // e.g. "typing" when applicable
  };
  
  export type ChatBubbleType = {
    _id: string;
    messages: Message[];
  };
  
  export type ChatHeaderProps = {
    pic?:Attachment
    status: UserStatus;
  };
  
  export interface ChatInfoResponse {

      _id: string;
      members: string[];
      isGroup?: boolean;
       lastMessage?: string
       name: string 
       description:string
       avatarURL?:any
       unreadCount:number
  }

  export  type ConversationInfoResponse =
  | { status: number; message: Message[] };

  export type ConversationMetaData={
    type: 'group' | "private",
    metadata: {
        id?: string,
        name?:string,
        description?: string,
        avatarURL?: Attachment,
        admin: string,
        members: [],
        memberCount: number
    }
  
    
  }

 