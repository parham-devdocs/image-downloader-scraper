import { GroupHeaderProps } from "@/types";
import Image from "next/image";
import personPic from "../../../public/person.jpeg";

export default function GroupHeader({ pic, name, onlineUsers, typingUsers }: GroupHeaderProps) {
 
  const typingUsersList = Array.from(typingUsers).join(', ');
  const typingUsersCount = typingUsers.size;
  
  // Function to get proper typing message
  const getTypingMessage = () => {
    if (typingUsersCount === 0) return null;
    if (typingUsersCount === 1) return `${typingUsersList} is typing...`;
    if (typingUsersCount === 2) return `${typingUsersList} are typing...`;
    return `${typingUsersCount} people are typing...`;
  };
  
  // Fixed: Use onlineUsers, not typingUsersList
  const getOnlineUsersCountMessage = () => {
    if (onlineUsers === 0) return "No one is online";
    if (onlineUsers === 1) return "1 person is online";
    return `${onlineUsers} people are online`;
  };
  
  const typingMessage = getTypingMessage();
  const onlineUsersMessage = getOnlineUsersCountMessage();

  return (
    <header className="flex items-center px-6 py-4 bg-violet-600 border-b border-indigo-400/20 w-full shadow-sm">
      {/* Avatar Container */}
      <div className="relative w-11 h-11">
        <div className="relative w-full h-full overflow-hidden rounded-full border border-white/10">
          <Image
            src={pic?.url || personPic}
            alt={name || "User"}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Text Info */}
      <div className="ml-4 flex flex-col">
        <h1 className="font-semibold text-[16px] text-white tracking-tight">
          {name}
        </h1>
        
        <p className="text-[12px] transition-all duration-300 text-emerald-300 font-medium italic">
          {typingMessage || onlineUsersMessage}
        </p>
      </div>
    </header>
  );
}