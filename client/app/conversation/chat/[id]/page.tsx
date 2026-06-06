"use client"

import { ConversationMetaData, GeneralApiCallResult, Message, User } from '@/types'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getMessagesInChat, sendMessageToChat } from '../../../actions/messages'
import Loader from '../../../components/loader'
import MessageBubble from '../../../components/Chat/chatBubble'
import { getConversationMetaData } from '../../../actions/conversation'
import { socket } from '../../../socket'
import ChatHeader from '@/app/components/Chat/Header'
import ChatInput from '@/app/components/chatInput'
import useSocket from '@/app/hooks/useSocket'

const ChatPage = () => {
  const [messages, setMessages] = useState<GeneralApiCallResult<Message[]> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [currentUserData, setCurrentUserData] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [conversationMetaData, setConversationMetaData] = useState<ConversationMetaData | null>(null)
  const [error, setError] = useState<null | string>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { id } = useParams()
  
  const { userStatus } = useSocket({ conversationMetaData, id })
  
  const otherMemberUsername = conversationMetaData?.metadata?.otherMember?.username

  // Load conversation metadata
  useEffect(() => {
    const loadConversationMetaData = async () => {
      try {
        const response = await getConversationMetaData(String(id));
        setConversationMetaData(response?.message ?? null);
      } catch (error) {
        console.error("Failed to load conversation metadata:", error);
        setError("Failed to load conversation data");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      loadConversationMetaData();
    }
  }, [id]);

  // Load messages - FIXED VERSION
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationMetaData?.type) return;
      
      try {
        const response = await getMessagesInChat(String(id));
        console.log("Full response:", response);
        console.log("Response status:", response?.status);
        console.log("Response message:", response?.message);
        console.log("Is message an array?", Array.isArray(response?.message));
        
        // ✅ FIX: Accept both 200 and 201 status codes
        if (response?.status === 200 || response?.status === 201) {
          setMessages(response);
          console.log("Messages set successfully:", response.message?.length);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        setError("Failed to load messages");
      }
    };
    
    loadMessages();
  }, [id, conversationMetaData]);

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          setCurrentUserData(JSON.parse(userData));
          setError(null);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        setError("Failed to load user data. Please try again.");
      }
    };
    
    getUserData();
  }, []);

  // Handle sending messages - FIXED VERSION
  const sendMessage = async () => {
    if (!id || !inputValue.trim() || !currentUserData) return;
    
    try {
      const sentMessage = await sendMessageToChat({ chatId: id as string, content: inputValue });
      
      // ✅ FIX: Accept both 200 and 201
      if (sentMessage?.status === 200 || sentMessage?.status === 201) {
        // Reload messages after sending
        const response = await getMessagesInChat(String(id));
        if (response?.status === 200 || response?.status === 201) {
          setMessages(response);
        }
        setInputValue('');
        socket.emit("stop_typing", id);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (stopTypingTimeoutRef.current) {
          clearTimeout(stopTypingTimeoutRef.current);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message");
    }
  };

  // Handle typing indicator
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputValue(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }
    
    socket.emit("typing", id);
    
    stopTypingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", id);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className='w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100'>
      <ChatHeader 
        status={userStatus} 
        name={otherMemberUsername || "Chat"} 
      /> 
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <div 
            ref={chatContainerRef}
            className='flex-1 overflow-y-auto px-4 py-6 space-y-3'
          >
            {/* ✅ FIX: Check if messages exist and have length */}
            {messages?.message && messages.message.length > 0 ? (
              messages.message.map((m) => (
                <MessageBubble 
                  key={m._id}
                  _id={m._id} 
                  content={m.content} 
                  createdAt={m.createdAt} 
                  seen={m.seen} 
                  sender={m.sender} 
                  isOwn={currentUserData?._id === m.sender?._id} 
                  imageAvatarURL={m.imageAvatarURL}
                  type={m.type}
                  filename={m.filename}
                  size={m.size}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 mt-10">
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput  
            reloadData={() => {}} 
            type={"chat"} 
            inputValue={inputValue} 
            sendMessage={sendMessage} 
            onChangeHandler={onChangeHandler} 
            id={id}
          />
        </>
      )}
    </div>
  );
};

export default ChatPage;