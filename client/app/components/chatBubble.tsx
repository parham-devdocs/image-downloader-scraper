import React from "react";
import Avatar from "./avatar";
import { type ChatBubbleType } from "@/types";
export type ChatBubbleProps = ChatBubbleType & {
  isOwn: boolean;
};
const ChatBubble = ({ content, sender,isOwn, imageAvatarURL, createdAt }: ChatBubbleProps) => {
  return (
    <div className={`w-full flex ${isOwn ? "justify-start" : "justify-end"} my-8`}>
      
      <div className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>

        <Avatar name={sender.username} avatarURL={imageAvatarURL} />

        <div className="flex flex-col max-w-[70%]">
          
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
              {createdAt}
            </span>
          )}
        </div>

      </div>

    </div>
  );
};

export default ChatBubble;
