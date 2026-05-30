import React from "react";
import Avatar from "./avatar";
import { Message } from "@/types";
import formatTime from "../utils/formatTime";
import { LuCheckCheck } from "react-icons/lu";
import { BiCheck } from "react-icons/bi";
 type ChatBubbleProps  =  Message & {isOwn:boolean}

 
const SeenComponent = ({ seen,isOwn }: { seen: boolean,isOwn:boolean }) => {
  return seen && !isOwn ? (
    <div className="flex items-center gap-0.5" title="Seen">
      <LuCheckCheck  className="w-5 h-5 text-green-500" />
    </div>
  ) : (
    <div className="flex items-center gap-0.5" title="Delivered">
      <BiCheck  className="w-5 h-5 text-gray-200" />
    </div>
  );
};
const MessageBubble = ({ content,seen, sender,isOwn, imageAvatarURL, createdAt }: ChatBubbleProps ) => {
  return (
    <div className={`w-full flex ${isOwn ? "justify-start" : "justify-end"} my-8`}>
      
      <div className={`flex items-end gap-3 ${isOwn ? "" : " flex-row-reverse"}`}>

        <Avatar  url={imageAvatarURL?.url} filename={imageAvatarURL?.filename} />

        <div className="flex flex-col max-w-[70%] relative">
          
          <div
            className={`
              px-4 py-2
              rounded-2xl
              text-sm
              shadow-sm
              break-words
              ${
                isOwn
                  ? "bg-slate-200 text-slate-900 rounded-bl-md"
                  : "bg-violet-600 text-white rounded-br-md"
              }
            `}
          >
            {content}
          </div>

          {createdAt && (
            <span
              className={`text-[11px] mt-1 ${
                isOwn ? "text-right text-slate-400" : "text-slate-400"
              }`}
            >
              {formatTime(createdAt)}
            </span>
          )}
          <div className=" absolute bottom-5 right-1"><SeenComponent isOwn={isOwn} seen={seen}/></div>
        </div>

      </div>

    </div>
  );
};

export default MessageBubble
