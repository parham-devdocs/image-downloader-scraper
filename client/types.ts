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

  export type Avtar= {
    name:string,
    avatarURL?:string
  }
  

  export type ChatBubbleType=  {
    group:string
    content:string
    sender: {
       _id: string,
    username: string,
    email: string
  }
    imageAvatarURL?:string
    date:string
    seen:boolean
    createdAt: string

  }
  export type ChatHeaderProps = {
    name: string;
    avatar: string;
  status:"online"|"las seen recently"|"typing"
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
  
  