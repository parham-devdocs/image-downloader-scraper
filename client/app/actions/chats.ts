import {  ChatInfoResponse } from "@/types";
import apiClient from "../axios";


export async function getChatList(cookie?: string) {
    try {
        const response = await apiClient.get<ChatInfoResponse[]>(
            `/chat/chatList`,
            {
                headers: cookie ? {
                    'Cookie': `accessToken=${cookie}`
                } : {}
            }
        );
        return {status:response.status,message:response.data}
    } catch (error) {
        return  {status:500,message:error}
    }
}



