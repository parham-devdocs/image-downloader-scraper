"use server"
import {MembershipStatus } from "@/types";
import apiClient from "../axios";







export async function getGroupMembership(groupId:string) {
   
    try {
        const response=await apiClient.get<MembershipStatus>(`http://localhost:5000/api/group/${groupId}/membership`)
        return response.data

    } catch (error) {
        return error
    }
}
