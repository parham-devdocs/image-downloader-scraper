"use client"

import { ConversationMetaData, GeneralApiCallResult,  Message, User } from '@/types'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import {  getMessagesInGroup, sendMessageToGroup } from '../../../actions/messages'
import { getGroupMembership } from "../../../actions/groups";
import Loader from '../../../components/loader'
import MessageBubble from '../../../components/Group/groupBubble'
import { getConversationMetaData } from '../../../actions/conversation'
import { socket } from '../../../socket'
import ChatHeader from '@/app/components/Group/Header'
import ChatInput from '@/app/components/chatInput'
import JoinButton from '@/app/components/Group/joinButton'
import useSocket from '@/app/hooks/useSocket'
import Person from "../../../../public/person.jpeg";
const ChatPage = () => {
  const [messages, setMessages] = useState<GeneralApiCallResult<Message[]> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [currentUserData, setCurrentUserData] = useState<User | null>(null)
  const [isMember,setIsMember]=useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [conversationMetaData, setConversationMetaData] =useState<ConversationMetaData | null>(null)
  const [error, setError] = useState<null | string>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { id } = useParams() 
  const {onlineUsers,typingUsers}=useSocket({conversationMetaData,id})


 

  // 1. Setup socket event listeners (ONCE)

  // 2. Load conversation metadata
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

  const loadMessages = async () => {
    console.log(conversationMetaData)

    if (!conversationMetaData?.type) return;
    
    try {
      const response = await getMessagesInGroup(String(id));
      
      if (response?.status === 201) {
        setMessages(response);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Failed to load messages");
    }
  };

  // 3. Load messages when conversation metadata is loaded

  useEffect(()=>{
   async function checkMembershipStatus() {
    try {
      const response = await getGroupMembership(String(id));
      if (response?.status === 201 || response?.status===200) {
        setIsMember(response.message?.isMember as boolean)
        console.log({isMember})

      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Failed to load messages");
    }
  
  }
  checkMembershipStatus()
  },[messages])
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationMetaData?.metadata ) return;
      
      try {
        const response = await getMessagesInGroup(String(id));
        
        if (response?.status === 201) {
          setMessages(response);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        setError("Failed to load messages");
      }
    };
    
    loadMessages();
  }, [id, conversationMetaData]);

  // 4. Get user data from localStorage
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

  // 5. Handle sending messages - FIXED VERSION
  const sendMessage = async () => {
    if (!id || !inputValue.trim() || !currentUserData) return;
    
    try {
      const sentMessage = await sendMessageToGroup({ groupId: id as string, content: inputValue });
      loadMessages()
      if (sentMessage?.status === 201) {
        loadMessages()
        setInputValue('');
        // Emit stop typing when message is sent
        socket.emit("stop_typing", id);
        
        // Clear typing timeout
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

  // 6. Handle typing indicator - FIXED VERSION
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputValue(e.target.value);
    console.log(inputValue)
    // Clear existing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }
    
    // Emit typing event
    socket.emit("typing", id);
    
    // Set timeout to emit stop_typing after 1 second of no typing
    stopTypingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", id);
      console.log("stopped typing");
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className='w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100'>
      <ChatHeader 
      onlineUsers={onlineUsers}
      typingUsers={typingUsers}
      pic={conversationMetaData?.metadata.avatarURL}
        name={conversationMetaData?.metadata.otherMember?.username || "Chat"} 
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
            {messages?.message?.map((m) => (
              <MessageBubble 
                _id={m._id} 
                content={m.content} 
                createdAt={m.createdAt} 
                seen={m.seen} 
                sender={m.sender} 
                key={m._id} 
                isOwn={currentUserData?._id === m.sender?._id} 
                imageAvatarURL={m.imageAvatarURL}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
      {isMember ?    
            <ChatInput inputValue={inputValue} sendMessage={sendMessage} onChangeHandler={(e)=>onChangeHandler(e)}/>
            : <JoinButton groupId={id as string } loadData={loadMessages}/>
            }
        </>
      )}
    </div>
  );
};

export default ChatPage;