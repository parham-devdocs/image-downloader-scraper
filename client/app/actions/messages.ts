import { ChatBubbleType } from "@/types";
import apiClient from "../axios";
import { ParamValue } from "next/dist/server/request/params";

export async function getMessagesInGroup(groupId: string) {
  try {
    const result = await apiClient.get<any>(`/group/${groupId}/messages`);
    return {
      status: result.status,
      message: result.data.messages || result.data, // Handle both response structures
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      status: 500,
      message: []
    };
  }
}

export async function getMessagesInChat(chatId: string) {
  try {
    const result = await apiClient.get<any>(`/chat/${chatId}/messages`);
    console.log(result.data)
    return {
      status: result.status,
      message: result.data.messages || result.data,
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      status: 500,
      message: []
    };
  }
}

export async function sendMessageToChat({ content, chatId }: { content: string, chatId: string }) {
  try {
    const result = await apiClient.post("/chat", { content, chatId });
    return {
      status: result.status,
      message: result.data,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      status: 500,
      message: null
    };
  }
}

export async function sendMessageToGroup({ content, groupId }: { content: string, groupId: string }) {
  try {
    const result = await apiClient.post("/group/message", { content, groupId });
    return {
      status: result.status,
      message: result.data,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      status: 500,
      message: null
    };
  }
}

export async function sendFileToGroup({ groupId, formData }: { groupId: ParamValue, formData: FormData }) {
  try {
    const result = await apiClient.post(`/group/file/${groupId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return {
      status: result.status,
      message: result.data,
    };
  } catch (error) {
    console.error("Error sending file:", error);
    return {
      status: 500,
      message: null
    };
  }
}

export async function sendFileToChat({ chatId, formData }: { chatId: ParamValue, formData: FormData }) {
  try {
    const result = await apiClient.post(`/chat/file/${chatId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return {
      status: result.status,
      message: result.data,
    };
  } catch (error) {
    console.error("Error sending file:", error);
    return {
      status: 500,
      message: null
    };
  }
}