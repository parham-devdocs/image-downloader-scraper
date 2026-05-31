import {  ChatInfoResponse, GeneralApiCallResult } from "@/types";
import apiClient from "../axios";


export async function getChatList(): Promise<GeneralApiCallResult<ChatInfoResponse[]> | null>{
    try {
        const response = await apiClient.get<ChatInfoResponse[]>(
            `/chat/chatList`);
        console.log({data:response.data})
        return {status:response.status,message:response.data}
    } catch (error:any) {
        console.log("error occured at get chats endpoint",error.message)
        return  {status:500,message:[]}    }
}



