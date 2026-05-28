import mongoose from "mongoose"


export interface User{
    id:string
    username:string
    userId:string
    isAdmin:boolean
    email:string
    password:string
    refreshToken?:string
    accessToken?:string
}

export interface Group{
    name:string
    admin:any
    description:string
    members:any[]
 avatarURL?:any
 messages:any
 lastMessage?:any


}

export interface Message {
    id: string;
    content: string;
    seen:boolean
    createdAt: string;  
    sender:any 
 
}


export interface Chat {
    id: string;
    lastMessage?:any
    members:any
    updatedAt: string; 
    avatarURL?:any
    description:string
    messages:any

  
}

