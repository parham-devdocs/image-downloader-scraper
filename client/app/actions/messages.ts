import { ChatBubbleType, ConversationInfoResponse } from "@/types";
import apiClient from "../axios";
import { notFound } from "next/navigation";

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





export async function getMessagesInGroup(groupId:string) {

  try {
    const result= await apiClient.get<ChatBubbleType>(
      `group/${groupId}/messages`
    )
    return {
      status: result.status,
      message: result.data.messages,
    }; 
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      status: 500,
      message:[]
    };
  }

}
export async function getMessagesInChat(chatId:string) {

  try {
    const result= await apiClient.get<ChatBubbleType>(
      `chat/${chatId}/messages`
    )
    return {
      status: result.status,
      message: result.data.messages,
    }; 
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      status: 500,
      message:[]
    };
  }

}