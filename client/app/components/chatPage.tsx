"use client"

import { ChatBubbleType, ConversationInfoResponse, Message, User, UserStatus } from '@/types'
import React, { useEffect, useState, useRef, useEffectEvent } from 'react'
import { useParams } from 'next/navigation'
import { getMessagesInConversation } from '../actions/messages'
import Loader from './loader'
import ChatHeader from './ChatHeader'
import MessageBubble from './messageBubble'
import { BsEmojiGrin } from 'react-icons/bs'
import { BiCamera, BiMicrophone, BiSend } from 'react-icons/bi'
import { CgAttachment } from 'react-icons/cg'

const ChatPage = () => {
  const [messages, setMessages] = useState<ConversationInfoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [currentUserData,setCurrentUserData]=useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<null | string>(null);

  const { id,conversationType } = useParams()
  
  const userStatus: UserStatus = {
    username: "l,l;l",
    presence: "online",
    activity: "typing"
  }///getting data for messages


  ////// refetching data
const loadData = async () => {
  try {
    const response = await getMessagesInConversation(String(id))
    console.log(response)
    if (response.status === 201) {
      setMessages(response)
    }
  } catch (error) {
    console.error("Failed to load messages:", error)
  } finally {
    setIsLoading(false)
  }
}

  useEffectEvent(() => {
   console.log("event")

    loadData()
  })

  ///getting data for messages - initial fetch
  useEffect(()=>{
    const loadData = async () => {
      try {
        const response = await getMessagesInConversation(String(id))
        console.log(response)
        if (response.status === 201) {
          setMessages(response)
        }
      } catch (error) {
        console.error("Failed to load messages:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  },[id])

  ////////  getting user data from local storage

  

useEffect(() => {
  const getUserData = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setCurrentUserData(JSON.parse(userData));
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      setError("Failed to load user data. Please try again.");
    }
  };

  getUserData();
}, [id]);

/////// on change handler
function onChangeHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
  e.preventDefault()
  setInputValue(e.target.value)
  console.log(inputValue)
}

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])


  return (
    <div className='w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100'>
      <ChatHeader status={userStatus} />
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {/* Chat Messages Container - Scrollable */}
          <div 
            ref={chatContainerRef}
            className='flex-1 overflow-y-auto px-4 py-6 space-y-3'
          >
            {messages?.message.map((m, index) => {
              console.log({currentUser:currentUserData?._id,messageSenderId:m._id})
            return  <MessageBubble 
                _id={m._id} 
                content={m.content} 
                createdAt={m.createdAt} 
                seen={m.seen} 
                sender={m.sender} 
                key={m._id} 
                isOwn={currentUserData?._id===m.sender._id } 
                imageAvatarURL={m.imageAvatarURL}
              />
})}
            <div ref={messagesEndRef} />
          </div>

          {/* Beautiful Input Section */}
          <div className="border-t w-full border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4">
  <div className="w-full mx-auto">
    <div className="flex items-center gap-3 w-full">
      {/* Emoji Button */}
     

      {/* Text Input - takes remaining width */}
      <div className="flex-1 min-w-0">
        <textarea
          value={inputValue}
          onChange={(e) => onChangeHandler(e)}
          placeholder="Type a message..."
          rows={1}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all duration-200 resize-none"
        
        />
      </div>
      <button type="submit" onClick={loadData} className="  mb-1.5 bg-violet-600  text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
       <BiSend/>
      </button>
      <button className=" mb-1.5 bg-violet-600  text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
       <BiMicrophone/>
      </button>
      <button className=" mb-1.5 bg-violet-600  text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
       <BiCamera/>
      </button>
      <button className=" mb-1.5 bg-violet-600  text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
       <CgAttachment/>
      </button>
      {/* Send Button */}
     
    </div>
  </div>
</div>
        </>
      )}
    </div>
  )
}

export default ChatPage