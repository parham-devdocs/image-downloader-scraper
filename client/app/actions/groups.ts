import {ChatInfoResponse, GeneralApiCallResult, MembershipStatus } from "@/types";
import apiClient from "../axios";







export async function getGroupMembership(groupId:string) {
   
    try {
        const response=await apiClient.get<MembershipStatus>(`http://localhost:5000/api/group/${groupId}/membership`)
        return response.data

    } catch (error) {
        return error
    }
}


export async function getGroupList(): Promise<GeneralApiCallResult<ChatInfoResponse[]> | null>{
    try {
        const response = await apiClient.get<ChatInfoResponse[]>(
            `/group`
        );
        console.log({data:response.data})
        return {status:response.status,message:response.data}
    } catch (error:any) {
        console.log("error occured at get groups endpoint",error.message)
        return  {status:500,message:[]}
    }
}


