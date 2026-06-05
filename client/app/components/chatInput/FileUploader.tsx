"use client"
import { sendFileToGroup } from "@/app/actions/messages"
import { ParamValue } from "next/dist/server/request/params"
import {  useState } from "react"
import { CgAttachment } from "react-icons/cg"



const FileUploader = ({groupId}:{groupId:ParamValue}) => {
  async function selectFileHandler(e:any) {
    console.log(e.target.files[0])
    const file=e.target.files[0]
    if (!file) {
        return null
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('fileSize', file.size);

    const result=await sendFileToGroup({groupId,formData})
    console.log(result.message)
   }
   console.log(new FormData)

  return (
<button className="mb-1.5 relative bg-violet-600 cursor-pointer text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
          <CgAttachment />
          <input type="file" onChange={(e)=>{selectFileHandler(e)}} accept="image/*" capture className=' absolute inset-0 opacity-0 cursor-pointer ' />

        </button>  
        )
}

export default FileUploader