import {  ChatInfoResponse, GeneralApiCallResult } from "@/types";
import apiClient from "../axios";


export async function getChatList(cookie?: string): Promise<GeneralApiCallResult<ChatInfoResponse[]> | null>{
    try {
        const response = await apiClient.get<ChatInfoResponse[]>(
            `/chat/chatList`,
            {
                headers: cookie ? {
                    'Cookie': `accessToken=${cookie}`
                } : {}
            }
        );
        console.log({data:response.data})
        return {status:response.status,message:response.data}
    } catch (error:any) {
        return  {status:500,message:error}
    }
}



