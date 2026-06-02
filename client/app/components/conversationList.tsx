"use client"
import ChatItem from './conversationListItem';
import ChatListFooter from './conversationListFooter';
import ChatListHeader from './conversationListHeader';
import PersonPic from "../../public/person.jpeg";
import { ChatInfoResponse,GeneralApiCallResult } from '@/types';
import Link from 'next/link';
import { getChatList } from '../actions/chats';
import ConversationListTab from './conversationListTab';
import { useEffect, useState } from 'react';
import Loader from './loader';
import { getGroupList } from '../actions/groups';


 export type ConversationListType = "Groups" | "Chats"
export default function ConversationList() {
  const [state, setState] = useState<ConversationListType>("Groups")
  const [result, setResult] = useState<GeneralApiCallResult<ChatInfoResponse[]> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      
      let response:any;
      setLoading(true)
      if (state==="Chats") {
         response = await getChatList()

      }
      if (state==="Groups") {
        response = await getGroupList()

     }
      setResult(response)
      setLoading(false)
    }
    loadData()
  }, [state])
 
  
  // Handle error responses
  if ( result?.status === 404 || result?.status === 500 || result?.status === 401) {
    const errorMessage = result?.message ? String(result.message) : "Failed to load groups";
    const statusCode = result?.status || "Unknown";
    
    return (
      <div className=' w-72 border-r-4 border-r-violet-600'>
        <ChatListHeader />
        {loading && <Loader size="md"/>}
        <div className='max-h-[542px] overflow-x-auto flex items-center justify-center p-4'>
          <div className="text-red-500 text-center">
            <p className="font-semibold">Error {statusCode}</p>
            <p>{errorMessage}</p>
            <div className="text-sm mt-4">
              <Link href="/login" className="text-blue-500 underline hover:text-blue-700">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
        <ChatListFooter />
      </div>
    );
  }
  
  // Extract groups from response (adjust based on your API response structure)
  // Handle case where groups is not an array
  
  return (
    <div className=' border-r-4 border-r-violet-600 w-72  '>
      <ChatListHeader />
      <ConversationListTab onTabChangeHandler={(value:ConversationListType)=>{setState(value)}}/>
      <div className=' max-h-[480px] overflow-hidden'>
        {result?.message && result?.message?.length > 0 ? (
          result?.message.map((chat: ChatInfoResponse, index: number) => (
            <ChatItem
              key={chat._id || index}
              _id={chat._id}
              description={chat.description}
              lastMessage={chat.lastMessage}
              members={chat.members}
              unreadCount={chat.unreadCount || 0}
              avatarURL={chat.avatarURL || PersonPic}
              name={chat.name}
              type={state==="Chats"? "chat" : "group"}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 p-4">
            No groups found. Create a new group to get started!
          </div>
        )}
      </div>
      <ChatListFooter />
    </div>
  );
}