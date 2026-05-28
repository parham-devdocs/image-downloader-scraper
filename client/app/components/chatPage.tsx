"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { socket } from "../socket";
import ChatBubble from "./chatBubble";
import ChatHeader from "./ChatHeader";
import { CgAttachment } from "react-icons/cg";
import { BiCamera, BiMicrophone, BiSend } from "react-icons/bi";
import { getMessages, postMessage } from "../actions/messages";
import { useParams } from 'next/navigation';
import { ChatBubbleType, MembershipStatus, User } from "@/types";
import _ from "lodash";
import Loader from "./loader";
import { getGroupMembership } from "../actions/groups";

// TODO: Replace this with your actual Auth hook/context

export default function ChatPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const groupId = params?.groupId as string;
const [isMember,setIsMember]=useState(false)
  const [typingStatus, setTypingStatus] = useState({ isTyping: false, username: "" });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatBubbleType[]>([]);
  const [loading, setLoading] = useState(true);
const [user,setUser]=useState<User| null>(null)
  
  // 1. Auto-scroll to bottom when messages change
// Add this ref to track if user is viewing history
const isUserScrollingUpRef = useRef(false);

// Add this effect to detect manual scroll
useEffect(() => {
  const container = messagesContainerRef.current;
  if (!container) return;

  const handleScroll = () => {
    // If user is more than 100px from bottom, they're reading history
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    isUserScrollingUpRef.current = !isAtBottom;
  };

  container.addEventListener("scroll", handleScroll, { passive: true });
  return () => container.removeEventListener("scroll", handleScroll);
}, []);

// Modify the scroll effect to respect user scroll position
useEffect(() => {
  // Only auto-scroll if:
  // 1. We're at the bottom already, OR
  // 2. User hasn't scrolled up to read history
  if (!isUserScrollingUpRef.current && messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "auto" });
  }
}, [messages]);
   // ✅ "Asynchronous" setState - runs later, after current render cycle

   useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getGroupMembership(groupId) as MembershipStatus
        setIsMember(data.isMember);
        console.log({groupId,isMember:data.isMember,user:user?._id})
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData()
  }, [groupId]);

useEffect(() => {
  const stored = localStorage.getItem("user");
  if (stored) {
    // Wrapped in setTimeout → defers to next tick
    setTimeout(() => {
      setUser(JSON.parse(stored));
      console.log(user)

    }, 0);
  }
}, []);
  // 2. Fetch Messages (Only when groupId changes)
  useEffect(() => {
    if (!groupId) return;
   
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getMessages(groupId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId]); // Removed 'input' from dependencies to prevent infinite loops

  // 3. Setup Socket Listeners
  useEffect(() => {
    if (!groupId) return;

    const onConnect = () => {
      console.log("Connected:", socket.id);
    };

    const onTypingIndicator = (data: { isTyping: boolean; username: string }) => {
      // Only update if it's not the current user typing
      console.log("is typing")
      if (data.username !==user?.username) {
        setTypingStatus({
          isTyping: data.isTyping,
          username: data.username
        });
      }
    };

    const onNewMessage = (newMessage: ChatBubbleType) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("connect", onConnect);
    socket.on("typing_indicator", onTypingIndicator);

    return () => {
      socket.off("connect", onConnect);
      socket.off("typing_indicator", onTypingIndicator);
    };
  }, [groupId]);

  // 4. Debounced "Stop Typing" Logic
  // We create this debounced function ONCE using useMemo
  const debouncedStopTyping = useMemo(
    () => _.debounce((groupId: string) => {
      socket.emit("stop_typing", { groupId, userId:user?._id});
    }, 2000),
    [] // Empty dependency array ensures this function identity stays stable
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedStopTyping.cancel();
    };
  }, [debouncedStopTyping]);

  // 5. Handle Input Change
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim()) {
      // Emit "typing" immediately
      socket.emit("typing", { groupId, userId: user?._id });
      
      // Schedule "stop_typing" to fire after 2 seconds of inactivity
      debouncedStopTyping(groupId);
    } else {
      // If input is cleared, cancel the pending stop_typing and emit stop immediately
      debouncedStopTyping.cancel();
      socket.emit("stop_typing", { groupId, userId: user?._id });
    }
  };

  // 6. Send Message
  const sendMessage = async () => {
    if (!input.trim() || !groupId) return;

    // Optimistic UI update or wait for server? 
    // Here we emit to socket AND save to DB
    
    // 1. Emit to socket for real-time delivery
    socket.emit("send_message", { 
      groupId, 
      content: input,
      senderId: user?._id
    });
    
    // 2. Save to DB (Adjust based on your architecture)
    // If your socket server saves to DB, you might not need this API call.
    // If you need both:
    await postMessage(groupId, input); 
    setLoading(true);
    try {
      const data = await getMessages(groupId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
    setInput("");
    debouncedStopTyping.cancel(); // Cancel any pending "stop typing"
    socket.emit("stop_typing", { groupId, userId:user?._id });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen flex-col justify-between bg-gray-100">
      {/* Header */}
      <ChatHeader 
        avatar={"/person.jpeg"} 
        name="ali reza" 
        status={typingStatus.isTyping ? "typing" : "online"} 
      />

      {/* Messages Area */}
      <div className="flex-1 p-4 w-full overflow-y-auto" ref={messagesContainerRef}>
        {loading ? (
          <div className=" w-full h-full flex items-center justify-center" ><Loader size="lg"/></div>
        ) : messages && messages.length > 0 ? (
          <div className="flex flex-col gap-2">
            {messages.map((msg, index) => (
              <ChatBubble 
                key={ index} // Use unique ID if available
                group={msg.group}
                seen={msg.seen}
                createdAt={msg.createdAt}
                sender={msg.sender} 
                isOwn={msg.sender?._id === user?._id} 
                content={msg.content} 
                imageAvatarURL={msg.imageAvatarURL || "/person.jpeg"} 
                date={new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
            ))}
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <p className="text-center text-gray-400 py-10">No messages yet. Say hello!</p>
        )}
      </div>

      {/* Input Form */}
      {isMember ?  <div className="p-4 border-t flex items-center gap-2 bg-white">
        <input
          className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-violet-200 text-black"
          value={input}
          onChange={inputChangeHandler}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
        />
        <button
          onClick={sendMessage}
          className="bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 transition"
          title="Voice Note"
        >
          <BiMicrophone />
        </button>
        <button
          className="bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 transition"
          title="Camera"
        >
          <BiCamera />
        </button>
        <button
          className="bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 transition"
          title="Attach File"
        >
          <CgAttachment />
        </button>
        <button
          onClick={sendMessage}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition"
          title="Send"
        >
          <BiSend />
        </button>
      </div>: <div className="p-4 border-t bg-white">
  <button
    className="
      w-full
      bg-gradient-to-r
      from-violet-600
      to-purple-500
      hover:from-violet-700
      hover:to-purple-600
      text-white
      font-semibold
      py-3
      rounded-2xl
      shadow-md
      hover:shadow-xl
      transition-all
      duration-300
      active:scale-95
    "
  >
    Join Group
  </button>
</div>}
     
    </div>
  );
}