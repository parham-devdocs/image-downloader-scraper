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
type:"file" | "voice"| "text"
    sender: User
    imageAvatarURL?:Attachment
    seen:boolean
    createdAt: string
    isOwn?:boolean
    filename?:string
    size?:string

  
  }

  export type PresenceStatus = "online" | "offline";
  
  export type UserStatus = {
    presence: PresenceStatus;
    isTyping?: boolean
  };
  
  export type ChatBubbleType = {
    _id: string;
    messages: Message[];
  };
  
  export type ChatHeaderProps = {
    pic?:Attachment
    status: UserStatus;
    name?:string
  
  };
  export type GroupHeaderProps = {
    pic?:Attachment
    name:string
    typingUsers:Set<string>
    onlineUsers:number
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
       type:"group"|"chat"
  }

 
  export type ConversationMetaData={
    type: 'group' | "chat",
    metadata: {
        id?: string,
        name?:string,
        description?: string,
        avatarURL?: Attachment,
        admin: string,
        members: [],
        memberCount: number
        otherMember?:{username:string,email:string,_id:string}
    }
  
    
  }

 export  type GeneralApiCallResult<T> = {
    status: number;          
    message: T;       
  };
  