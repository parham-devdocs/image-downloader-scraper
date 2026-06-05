"use client"
import { sendFileToGroup, sendFileToChat } from "@/app/actions/messages"
import { ParamValue } from "next/dist/server/request/params"
import { CgAttachment } from "react-icons/cg"

interface FileUploaderProps {
  groupId?: ParamValue;  // Optional - only for group chats
  chatId?: ParamValue;   // Optional - only for private chats
  onUploadComplete?: (result: any) => void; // Optional callback
}

const FileUploader = ({ groupId, chatId, onUploadComplete }: FileUploaderProps) => {
  
  async function selectFileHandler(e: any) {
    const file = e.target.files[0]
    if (!file) {
      return null
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('fileSize', file.size.toString());
    
    let result;
    
    // ✅ Determine where to send based on which ID is provided
    if (groupId) {
      // Send to group
      console.log('Sending file to group:', groupId);
      result = await sendFileToGroup({ groupId, formData });
    } else if (chatId) {
      // Send to private chat
      console.log('Sending file to chat:', chatId);
      result = await sendFileToChat({ chatId, formData });
    } else {
      console.error('Neither groupId nor chatId provided');
      return;
    }
    
    console.log('Upload result:', result);
    
    // Call callback if provided
    if (onUploadComplete) {
      onUploadComplete(result);
    }
    
    // Clear the input
    e.target.value = '';
  }
  
  return (
    <button className="mb-1.5 relative bg-violet-600 cursor-pointer text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
      <CgAttachment />
      <input 
        type="file" 
        onChange={selectFileHandler} 
        accept="image/*,audio/*,application/pdf" 
        className='absolute inset-0 opacity-0 cursor-pointer'
      />
    </button>  
  )
}

export default FileUploader