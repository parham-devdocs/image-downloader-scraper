"use client"

import { ConversationMetaData, GeneralApiCallResult, Message, User, UserStatus } from '@/types'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getMessagesInChat, sendMessageToChat } from '../../../actions/messages'
import Loader from '../../../components/loader'
import MessageBubble from '../../../components/messageBubble'
import { BiCamera, BiMicrophone, BiSend } from 'react-icons/bi'
import { CgAttachment } from 'react-icons/cg'
import { getConversationMetaData } from '../../../actions/conversation'
import { socket } from '../../../socket'
import ChatHeader from '@/app/components/Chat/Header'
import ChatInput from '@/app/components/chatInput'

const ChatPage = () => {
  const [messages, setMessages] = useState<GeneralApiCallResult<Message[]> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [currentUserData, setCurrentUserData] = useState<User | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [conversationMetaData, setConversationMetaData] = useState<GeneralApiCallResult<ConversationMetaData> | null>(null)
  const [error, setError] = useState<null | string>(null);
  const [isOnline, setIsOnline] = useState<number>(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { id } = useParams()
  
  const [userStatus, setUserStatus] = useState<UserStatus>({
    presence: "online",
    isTyping: false
  })

  // 1. Setup socket event listeners (ONCE)
  useEffect(() => {
    const onConnect = () => {
      console.log('Socket connected:', socket.id);
      // Join room when socket connects
      if (id) {
        console.log("Joining room after connect:", id);
        socket.emit("join_room", id);
      }
    };

    const onUserInRoom = (users: string[]) => {
      console.log("Users in room:", users);
      setIsOnline(users.length);
    };

    const onNotification = (notification: {
      type: string;
      message: string;
      user: string;
    }) => {
      console.log(`${notification.type}: ${notification.message}`);
      // You can show a toast notification here
    };

    const onTypingIndicator = (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
      
      // Update userStatus if this is the other user typing
      if (conversationMetaData?.message?.metadata.otherMember?._id === data.userId) {
        setUserStatus(prev => ({
          ...prev,
          isTyping: data.isTyping
        }));
      }
    };

    const onNewMessage = (message: Message) => {
      console.log("New message received:", message);
      // Add new message to the messages list
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

    socket.on('connect', onConnect);
    socket.on("user in room", onUserInRoom);
    socket.on("notification", onNotification);
    socket.on("typing_indicator", onTypingIndicator);
    socket.on("new_message", onNewMessage);

    // If socket is already connected, join room immediately
    if (socket.connected && id) {
      console.log("Socket already connected, joining room:", id);
      socket.emit("join_room", id);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off("user in room", onUserInRoom);
      socket.off("notification", onNotification);
      socket.off("typing_indicator", onTypingIndicator);
      socket.off("new_message", onNewMessage);
      
      // Leave room when component unmounts
      if (id) {
        socket.emit("leave_room", id);
      }
    };
  }, [id, conversationMetaData?.message?.metadata.id]); // Added conversationMetaData dependency

  // 2. Load conversation metadata
  useEffect(() => {
    const loadConversationMetaData = async () => {
      try {
        const response = await getConversationMetaData(String(id));
        setConversationMetaData(response);
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

    if (!conversationMetaData?.message?.type) return;
    
    try {
      const response = await getMessagesInChat(String(id));
      
      if (response?.status === 201) {
        setMessages(response);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Failed to load messages");
    }
  };

  // 3. Load messages when conversation metadata is loaded
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationMetaData?.message?.type) return;
      
      try {
        const response = await getMessagesInChat(String(id));
        
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
      const sentMessage = await sendMessageToChat({ chatId: id as string, content: inputValue });
      
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
  const onChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setInputValue(e.target.value);
    
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
        status={userStatus} 
        name={conversationMetaData?.message.metadata.otherMember?.username || "Chat"} 
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

         <ChatInput inputValue={inputValue} sendMessage={sendMessage} onChangeHandler={()=>onChangeHandler}/>
        </>
      )}
    </div>
  );
};

export default ChatPage;