import {  ConversationMetaData, GeneralApiCallResult } from "../../types";
import apiClient from "../axios";





export async function getConversationMetaData(
    id: string
  ): Promise<GeneralApiCallResult<ConversationMetaData> | null> {
    try {
      const response = await apiClient.get<ConversationMetaData>(`/conversation/${id}/metadata`);
  
      return {
        status: response.status,
        message: response.data,
      };
    } catch (error) {
      console.error("Error fetching conversation metadata:", error);
      return null;
    }
  }
  