import { ChatHeaderProps } from "@/types";
import Image from "next/image";
import personPic from "../../public/person.jpeg";

export default function ChatHeader({ pic, status,name,type,onlineUsers ,typingUsers}: ChatHeaderProps) {
  const getStatusColor = () => {
    if (!status) return "bg-slate-400"; // Default

    switch (status.presence) {
      case "online":
        return "bg-emerald-400 ring-2 ring-[#4F46E5]"; // Green with a ring for contrast
      case "offline":
        return "bg-slate-400 ring-2 ring-[#4F46E5]";
      case "last_seen_recently":
        return "bg-amber-400 ring-2 ring-[#4F46E5]";
      default:
        return "bg-slate-400 ring-2 ring-[#4F46E5]";
    }
  };

  const getActivityText = () => {
    if (!status) return "";
    const { activity, presence } = status;

    if (activity === "typing") return "typing...";
    
    // Clean up "last_seen_recently" label for UI
    if (presence === "last_seen_recently") return "last seen recently";
    return presence;
  };

  const activityText = getActivityText();
  const statusColor = getStatusColor();

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
        
        {type==="chat"&& status && (
          <p className={`text-[12px] transition-all duration-300 ${
            status.activity === "typing" ? "text-emerald-300 font-medium italic" : "text-indigo-100/80"
          }`}>
            {activityText}
          </p>
        )}
          { type==="group"  && (
        <div className="px-4 py-1 text-xs  border-b">
          {onlineUsers.length} user(s) online: {onlineUsers.join(', ')}
        </div>
      )}

      </div>
    </header>
  );
}
