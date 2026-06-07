import React from "react";
import Avatar from "../avatar";
import { Message } from "@/types";
import formatTime from "../../utils/formatTime";
import { LuCheckCheck } from "react-icons/lu";
import { BiCheck } from "react-icons/bi";
import TextBubble from "../Chat/bubble/text";
import FileBubble from "../Chat/bubble/file";

type GroupBubbleProps = Message & { isOwn: boolean };

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
  type,
  _id,
  file,
  isOwn,
  imageAvatarURL,
  createdAt,
}: GroupBubbleProps) => {
  return (
    <div className={`w-full flex ${isOwn ? "justify-end" : "justify-start"} my-8`}>
      <div className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
        <Avatar  url={imageAvatarURL?.url} filename={imageAvatarURL?.filename} />

        <div className={`w-full overflow-x-hidden  flex ${isOwn ? "justify-end" : "justify-start"} my-8`}>
      
      <div className={`flex max-w-[70%] items-end gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>

        {/* <Avatar    url={imageAvatarURL.url} filename={imageAvatarURL.filename} /> */}
       {type === "text" && <TextBubble isOwn={isOwn as boolean}  seen={seen} createdAt={createdAt} content={content} /> }
       {type==="file" && <FileBubble _id={_id}  id={_id} file={file} isOwn={isOwn as boolean} seen={seen} createdAt={createdAt}/>}

      </div>

    </div>
      </div>
    </div>
  );
};

export default GroupBubble;
