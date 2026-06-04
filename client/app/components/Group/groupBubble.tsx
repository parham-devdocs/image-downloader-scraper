import React from "react";
import Avatar from "../avatar";
import { Message } from "@/types";
import formatTime from "../../utils/formatTime";
import { LuCheckCheck } from "react-icons/lu";
import { BiCheck } from "react-icons/bi";

type ChatBubbleProps = Message & { isOwn: boolean };

const SeenComponent = ({ seen, isOwn }: { seen: boolean; isOwn: boolean }) => {
  return seen && !isOwn ? (
    <div className="flex items-center gap-0.5" title="Seen">
      <LuCheckCheck className="w-5 h-5 text-green-500" />
    </div>
  ) : (
    <div className="flex items-center gap-0.5" title="Delivered">
      <BiCheck className="w-5 h-5 text-gray-200" />
    </div>
  );
};

const GroupBubble = ({
  content,
  seen,
  sender,
  isOwn,
  imageAvatarURL,
  createdAt,
}: ChatBubbleProps) => {
  return (
    <div className={`w-full flex ${isOwn ? "justify-end" : "justify-start"} my-8`}>
      <div className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
        <Avatar url={imageAvatarURL?.url} filename={imageAvatarURL?.filename} />

        <div className="flex flex-col max-w-[70%] relative scale-100 starting:scale-0  opacity-100 transition-all duration-700 ease-out starting:opacity-0">
          
          {/* Sender Name Display */}
          {!isOwn && sender.username && (
            <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">
              {sender.username}
            </span>
          )}

          <div
            className={`
              px-4 py-2
              rounded-2xl
              text-sm
              shadow-sm
              break-words
              ${
                isOwn
                  ? "bg-violet-600 text-white rounded-br-md"
                  : "bg-slate-200 text-slate-900 rounded-bl-md"
              }
            `}
          >
            {content}
          </div>

          {createdAt && (
            <span
              className={`text-[11px] mt-1 ${
                isOwn ? "text-slate-400" : "text-right text-slate-400"
              }`}
            >
              {formatTime(createdAt)}
            </span>
          )}

          {/* Seen Status (positioned relative to the bubble) */}
          {!isOwn && (
            <div className="absolute -right-6 bottom-5">
              <SeenComponent isOwn={isOwn} seen={seen} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupBubble;
