import { ChatBubbleType } from "@/types";
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



export async function getMessages(groupId: string) {
  try {
    const response = await apiClient.get<ChatBubbleType[]>(
      `/message/${groupId}`
    );
    // If the API returns empty or a 404 status, trigger Next.js 404 page
    if (!response.data || response.data.length === 0) {
      console.log({response:response.data})
      notFound(); // This throws an error internally to render not-found.js
    }

    return response.data; // ✅ Return data when found

  } catch (error) {
    console.error("Error fetching messages:", error);
    
    // Option 1: Return empty array for graceful UI handling
    return [];
    
    // Option 2: Trigger 404 for missing group (uncomment if preferred)
    // notFound();
  }
}