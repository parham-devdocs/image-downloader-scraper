"use client"

import { ChatBubbleType, ConversationInfoResponse, Message, User, UserStatus } from '@/types'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getMessagesInConversation } from '../actions/messages'
import Loader from './loader'
import ChatHeader from './ChatHeader'
import MessageBubble from './messageBubble'

const ChatPage = () => {
  const [messages, setMessages] = useState<ConversationInfoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [currentUserData,setCurrentUserData]=useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<null | string>(null);

  const { id } = useParams()
  
  const userStatus: UserStatus = {
    username: "l,l;l",
    presence: "online",
    activity: "typing"
  }
///getting data for messages
  useEffect(() => {
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
  }, [id])

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
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                {/* Attachment Button */}
                <button className="flex-shrink-0 text-gray-500 hover:text-purple-600 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all duration-200 resize-none"
                    style={{ maxHeight: "120px" }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        // Handle send message here
                      }
                    }}
                  />
                </div>

                {/* Emoji Button */}
                <button className="flex-shrink-0 text-gray-500 hover:text-yellow-500 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Send Button */}
                <button className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              
              {/* Typing Indicator (optional) */}
              <div className="mt-2 h-5">
                {/* You can add typing indicator here */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatPage