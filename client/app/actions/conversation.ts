import {  ConversationMetaData } from "../../types";
import apiClient from "../axios";





export async function getConversationMetaData(id: string): Promise<ConversationMetaData | null> {
    try {
        const response = await apiClient.get<ConversationMetaData>(`/conversation/${id}/metadata`);
        return response.data;
    } catch (error) {
        console.error("Error fetching conversation metadata:", error);
        return null; 
    }
}