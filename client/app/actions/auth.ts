"use server"

import { redirect } from "next/navigation";
import apiClient from "../axios";




export async function logout() {
  try {
    const response=await apiClient.get("http://localhost:5000/api/auth/logout",{withCredentials:true})
    // console.log({data:response.data})
    console.log(response.data)
    if (response.data) {
      
      redirect("/login")

    }
    return response.data


} catch (error) {
    return error
}
}