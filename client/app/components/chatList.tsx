import ChatItem from './chatItem';
import ChatListFooter from './chatListFooter';
import ChatListHeader from './chatListHeader';
import PersonPic from "../../public/person.jpeg";
import { ChatInfoResponse } from '@/types';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getChatList } from '../actions/chats';
import { notFound } from 'next/navigation';

export default async function GroupList() {
  const cookie = await (await cookies()).get("accessToken")?.value;
  const result = await getChatList(cookie) 
  
  if (!result || result.status===404) {
    console.log("not found")
    return notFound()
  }
  // Handle error responses
  if ( result.status === 404 || result.status === 500 || result.status === 401) {
    const errorMessage = result?.message ? String(result.message) : "Failed to load groups";
    const statusCode = result?.status || "Unknown";
    
    return (
      <div className='w-full border-r-4 border-r-violet-600'>
        <ChatListHeader />
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
  const groups = result.message
  
  // Handle case where groups is not an array
  const groupsArray = Array.isArray(groups) ? groups : [];
  
  return (
    <div className=' border-r-4 border-r-violet-600 w-72'>
      <ChatListHeader />
      <div className='max-h-[542px] overflow-x-auto'>
        {groupsArray.length > 0 ? (
          groupsArray.map((chat: ChatInfoResponse, index: number) => (
            <ChatItem
              key={chat._id || index}
              _id={chat._id}
              description={chat.description}
              lastMessage={chat.lastMessage}
              members={chat.members}
              unreadCount={chat.unreadCount || 0}
              avatarURL={chat.avatarURL || PersonPic}
              name={chat.name}
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