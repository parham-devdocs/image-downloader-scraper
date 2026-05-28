import { ChatBubbleType } from "@/types";
import apiClient from "../axios";

export async function postMessage(groupId: string, content?: string) {
  try {
    // If you are retrieving messages, GET is typical, but since you are using POST:
    const response = await apiClient.post<ChatBubbleType>(
      `http://localhost:5000/api/message`, 
      { content: content || "", group :groupId}
    );
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error("Error fetching messages:", error);
    return []; // Return an empty array instead of the raw error object to prevent UI crashes
  }
}


export async function getMessages(groupId: string) {
    try {
      // If you are retrieving messages, GET is typical, but since you are using POST:
      const response = await apiClient.get<ChatBubbleType[]>(
        `http://localhost:5000/api/message/${groupId}`, 
      );
      console.log(response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching messages:", error);
      return []; // Return an empty array instead of the raw error object to prevent UI crashes
    }
  }
  