"use client"

import { ConversationMetaData, GeneralApiCallResult, Message, User, UserStatus } from '@/types'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getMessagesInChat, getMessagesInGroup } from '../actions/messages'
import Loader from './loader'
import ChatHeader from './ChatHeader'
import MessageBubble from './messageBubble'
import { BiCamera, BiMicrophone, BiSend } from 'react-icons/bi'
import { CgAttachment } from 'react-icons/cg'
import { getConversationMetaData } from '../actions/conversation'
import { socket } from '../socket'

const ChatPage = () => {
  const [messages, setMessages] = useState<GeneralApiCallResult<Message[]> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [currentUserData, setCurrentUserData] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [conversationMetaData, setConversationMetaData] = useState<GeneralApiCallResult<ConversationMetaData> | null>(null)
  const [error, setError] = useState<null | string>(null);
  const [usersInRoom, setUsersInRoom] = useState<string[]>([]);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

  const { id } = useParams()
  
  const [userStatus,setUserStatus] =useState<UserStatus>({
    presence: "online",
    activity: "idle"
  })
  // 1. Setup socket event listeners (ONCE)
  useEffect(() => {
    const onConnect = () => {
      console.log('Socket connected:', socket.id);
      // Join room when socket connects
      if (id && !hasJoinedRoom) {
        console.log("Joining room after connect:", id);
        socket.emit("join_room", id);
        setHasJoinedRoom(true);
      }
    };

    const onUserInRoom = (users: string[]) => {
      console.log("Users in room:", users);
      setUsersInRoom(users);
    };

    const onNotification = (notification: {
      type: string;
      message: string;
      user: string;
    }) => {
      console.log(`${notification.type}: ${notification.message}`);
      // You can show a toast notification here
    };

    // For receiving new messages
    const onReceiveMessage = (message: Message) => {
      console.log("New message received:", message);
      setMessages(prev => {
        if (prev && prev.message) {
          return {
            ...prev,
            message: [...prev.message, message]
          };
        }
        return prev;
      });
    };

    const onTypingIndicator = (data: { userId: string; isTyping: boolean }) => {
      setUserStatus({activity:"typing",presence:"online"})
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    socket.on('connect', onConnect);
    socket.on("user in room", onUserInRoom);
    socket.on("notification", onNotification);
    socket.on("receive_message", onReceiveMessage);
    socket.on("typing_indicator", onTypingIndicator);

    // If socket is already connected, join room immediately
    if (socket.connected && id && !hasJoinedRoom) {
      console.log("Socket already connected, joining room:", id);
      socket.emit("join_room", id);
      setHasJoinedRoom(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off("user in room", onUserInRoom);
      socket.off("notification", onNotification);
      socket.off("receive_message", onReceiveMessage);
      socket.off("typing_indicator", onTypingIndicator);
      
      // Leave room when component unmounts
      if (id && hasJoinedRoom) {
        socket.emit("leave_room", id);
      }
    };
  }, [id]); // Add id as dependency

  // 3. Load conversation metadata
  useEffect(() => {
    const loadConversationMetaData = async () => {
      try {
        const response = await getConversationMetaData(String(id));
        setConversationMetaData(response);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      loadConversationMetaData();
    }
  }, [id]);

  // 4. Load messages when conversation metadata is loaded
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationMetaData?.message?.type) return;
      
      let response: GeneralApiCallResult<Message[]> | undefined;
      
      try {
        if (conversationMetaData.message.type === "group") {
          response = await getMessagesInGroup(String(id));
        } else if (conversationMetaData.message.type === "chat") {
          response = await getMessagesInChat(String(id));
        }
        
        if (response?.status === 201) {
          setMessages(response);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [id, conversationMetaData]);

  // 5. Get user data from localStorage
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

  // 6. Handle sending messages
  const sendMessage = () => {
    if (inputValue.trim() && currentUserData) {
      const messageData = {
        room: id,
        message: inputValue,
        sender: currentUserData._id,
        timestamp: Date.now(),
        content: inputValue
      };
      
      socket.emit("send_message", messageData);
      
      // Add message locally for immediate feedback
      const tempMessage: Message = {
        _id: Date.now().toString(),
        content: inputValue,
        createdAt: "",
        seen: true,
        sender: currentUserData,
        imageAvatarURL:undefined
      };
      
      setMessages(prev => {
        if (prev && prev.message) {
          return {
            ...prev,
            message: [...prev.message, tempMessage]
          };
        }
        return prev;
      });
      
      setInputValue('');
      
      // Emit stop typing when message is sent
     
    }
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setInputValue(e.target.value);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Emit typing event
    socket.emit("typing", id);
    
    // Set timeout to emit stop_typing after 1 second of no typing
    setTimeout(() => {
      socket.emit("stop_typing", id);
console.log("stoped")
    }, 2000);
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
      type={conversationMetaData?.message.type ? conversationMetaData.message.type:"chat"}
      typingUsers={usersInRoom}
        pic={conversationMetaData?.message.metadata.avatarURL} 
        status={userStatus} 
        name={conversationMetaData?.message.metadata.name ? conversationMetaData.message.metadata.name : "unknown"} 
        onlineUsers={usersInRoom}
      />
      
    
      
      {/* Show typing indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-1 text-xs text-gray-500 bg-gray-50 border-b italic">
          {Array.from(typingUsers).join(', ')} is typing...
        </div>
      )}
      
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
            {messages?.message.map((m) => (
              <MessageBubble 
                _id={m._id} 
                content={m.content} 
                createdAt={m.createdAt} 
                seen={m.seen} 
                sender={m.sender} 
                key={m._id} 
                isOwn={currentUserData?._id === m.sender._id} 
                imageAvatarURL={m.imageAvatarURL}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t w-full border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4">
            <div className="w-full mx-auto">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <textarea
                    value={inputValue}
                    onChange={onChangeHandler}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all duration-200 resize-none"
                  />
                </div>
                <button 
                  type="submit" 
                  onClick={sendMessage} 
                  className="mb-1.5 bg-violet-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <BiSend/>
                </button>
                <button className="mb-1.5 bg-violet-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <BiMicrophone/>
                </button>
                <button className="mb-1.5 bg-violet-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <BiCamera/>
                </button>
                <button className="mb-1.5 bg-violet-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <CgAttachment/>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatPage