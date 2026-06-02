import { ChatHeaderProps } from "@/types";
import Image from "next/image";
import personPic from "../../../public/person.jpeg";

export default function ChatHeader({ pic, status, name }: ChatHeaderProps) {
  const getStatusColor = () => {
    if (!status) return "bg-slate-400";

    switch (status.presence) {
      case "online":
        return "bg-emerald-400 ring-2 ring-[#4F46E5]";
      case "offline":
        return "bg-slate-400 ring-2 ring-[#4F46E5]";
      default:
        return "bg-slate-400";
    }
  };

  const getActivityText = () => {
    if (!status) return "";
    const { isTyping, presence } = status;
    
    if (isTyping) return `${name} is typing...`;
    if (presence === "online") return "Online";
    
    if (presence === "offline") return "Offline";
    return "";
  };

  const activityText = getActivityText();
  const statusColor = getStatusColor();
  const isTyping = status?.isTyping || false;

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
        
        {/* Status indicator on the Avatar corner */}
        {status && (
          <div
            className={`${statusColor} absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full transition-colors duration-300`}
          />
        )}
      </div>

      {/* Text Info */}
      <div className="ml-4 flex flex-col">
        <h1 className="font-semibold text-[16px] text-white tracking-tight">
          {name}
        </h1>
        
        <p className={`text-[12px] transition-all duration-300 ${
          isTyping ? "text-emerald-300 font-medium italic" : "text-indigo-100/80"
        }`}>
          {activityText}
        </p>
      </div>
    </header>
  );
}