import { ChatHeaderProps } from "@/types";
import Avatar from "./avatar";



export default function ChatHeader({ name, avatar, status }: ChatHeaderProps) {
  return (
    <div className="bg-violet-600 text-white px-4 py-3 flex items-center gap-3 shadow-md m-2 rounded-xl">

      <div className="relative">
        <Avatar name={name} avatarURL={avatar} />

        {status==="online" && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-violet-600 rounded-full"></span>
        )}
     {status==="las seen recently" && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 border-2 border-violet-600 rounded-full"></span>
        )}
      </div>

      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-sm">{name}</span>

        <span className="text-xs text-violet-200">
          {status==="online" && "online"}
          {status==="typing" && <span className=" animate-pulse">typing ...</span> }

        </span>
      </div>
    </div>
  );
}
