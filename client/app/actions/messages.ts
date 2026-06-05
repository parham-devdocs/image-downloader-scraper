import { ChatBubbleType } from "@/types";
import apiClient from "../axios";
import { ParamValue } from "next/dist/server/request/params";

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

export async function sendMessageToChat({content,chatId}:{content:string,chatId:string}) {
  try {
    const result= await apiClient.post("/message/chat",{content,chatId})
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


export async function sendMessageToGroup({content,groupId}:{content:string,groupId:string}) {
  try {
    const result= await apiClient.post("/message/group",{content,groupId})
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

export async function sendFileToGroup({groupId,formData}:{groupId:ParamValue,formData:FormData}) {
  try {
    const result= await apiClient.post(`message/group/file/${groupId}`,formData , {
      headers: {
        'Content-Type': 'multipart/form-data'
  }})
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