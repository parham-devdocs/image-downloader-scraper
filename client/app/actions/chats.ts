import { ChatInfoResponse } from "@/types";
import apiClient from "../axios";


export async function getGroups(cookie?: string) {
    try {
        const response = await apiClient.get<ChatInfoResponse[]>(
            `http://localhost:5000/api/group`,
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
