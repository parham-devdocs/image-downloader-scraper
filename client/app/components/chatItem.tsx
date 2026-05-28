import { ChatRoomResponse } from "@/types";
import Avatar from "./avatar";

import Link from "next/link";

const ChatItem = ({ name, avatarURL, lastMessage,_id,description ,unreadCount }: ChatRoomResponse) => {
 
  return (
    <Link className="group flex items-center w-72 h-20 px-4 cursor-pointer 
      hover:bg-violet-600 transition-all duration-200 border-b border-slate-200"
      href={`/${_id}`}
      >

    <Avatar name={name} avatarURL={avatarURL }/>

      <div className="flex-1 ml-4 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-900 group-hover:text-white truncate">
            {name}
          </h3>
          <span className="text-xs text-slate-400 group-hover:text-violet-200">
            12:30 PM
          </span>
        </div>

        <p className="text-sm text-slate-500 group-hover:text-violet-100 truncate mt-1">
          {lastMessage || "No messages yet"}
        </p>
      </div>

      {unreadCount ? (
        <div className="ml-2 bg-violet-600 group-hover:bg-white group-hover:text-violet-600 
          text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full transition mt-6">
          {unreadCount}
        </div>
      ) : null}
    </Link>
  );
};

export default ChatItem;
