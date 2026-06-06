import { ChatInfoResponse, GeneralApiCallResult, MembershipStatus } from "@/types";
import apiClient from "../axios";

export async function getGroupMembership(groupId: string): Promise<GeneralApiCallResult<MembershipStatus | null> | null> {
  try {
    // ✅ Fixed: Use relative URL, don't hardcode base URL
    const response = await apiClient.get<MembershipStatus>(`/group/${groupId}/membership`);
    return { status: response.status, message: response.data };
  } catch (error) {
    console.error("Error checking membership:", error);
    return { status: 500, message: null };
  }
}

export async function getGroupList(): Promise<GeneralApiCallResult<ChatInfoResponse[]> | null> {
  try {
    const response = await apiClient.get<ChatInfoResponse[]>(`/group`);
    console.log({ data: response.data });
    return { status: response.status, message: response.data };
  } catch (error: any) {
    console.log("error occurred at get groups endpoint", error.message);
    return { status: 500, message: [] };
  }
}

// ✅ Fixed: Changed to POST method (correct HTTP verb for joining)
export async function joinGroup(groupId: string): Promise<GeneralApiCallResult<any> | null> {
  try {
    const response = await apiClient.post(`/group/${groupId}/join`);
    console.log({ data: response.data });
    return { status: response.status, message: response.data };
  } catch (error: any) {
    console.log("error occurred at join group endpoint", error.message);
    return { status: 500, message: null };
  }
}

export async function leaveGroup(groupId: string): Promise<GeneralApiCallResult<any> | null> {
  try {
    const response = await apiClient.post(`/group/${groupId}/leave`);
    return { status: response.status, message: response.data };
  } catch (error: any) {
    console.log("error occurred at leave group endpoint", error.message);
    return { status: 500, message: null };
  }
}