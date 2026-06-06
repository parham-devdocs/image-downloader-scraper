import React from "react";
import Avatar from "../avatar";
import { Message } from "@/types";

import TextBubble from "./bubble/text";
import FileBubble from "./bubble/file";


 

const ChatBubble = ({ content,seen,isOwn, imageAvatarURL,file ,createdAt ,type,_id }: Message ) => {
  return (
    <div className={`w-full flex ${isOwn ? "justify-end" : "justify-start"} my-8`}>
      
      <div className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>

        {/* <Avatar    url={imageAvatarURL.url} filename={imageAvatarURL.filename} /> */}
       {type === "text" && <TextBubble isOwn={isOwn as boolean}  seen={seen} createdAt={createdAt} content={content} /> }
       {type==="file" && <FileBubble  _id={_id} file={file} isOwn={isOwn as boolean} seen={seen} createdAt={createdAt}/>}

      </div>

    </div>
  );
};

export default ChatBubble