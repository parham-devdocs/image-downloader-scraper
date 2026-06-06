"use client";
import {  useState } from "react";
import { BiCamera, BiSend } from "react-icons/bi";

import VoiceRecorder from "./voiceRecorder/voiceRecorder";

import FileUploader from "./FileUploader";
import VoiceRecorderBtn from "./voiceRecorder/voiceRecorderBtn";
import { ParamValue } from "next/dist/server/request/params";

type ChatInputProps = {
  inputValue: string;
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sendMessage: () => void;
  type:"chat"|"group",
  id:ParamValue
  reloadData:()=>void
};

const ChatInput = ({
  inputValue,
  onChangeHandler,
  sendMessage,
  type,
  id,
  reloadData

}: ChatInputProps) => {
  const [isRecording,setIsRecording]=useState(false)
  return (
    <div className="border-t w-full border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4 ">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 min-w-0">
            {isRecording ? (
              <VoiceRecorder />
            ) : (
              <input
                value={inputValue}
                onChange={onChangeHandler}
                placeholder="Type a message..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all duration-200 resize-none"
              />
            )}
          </div>
          <button
            type="submit"
            onClick={sendMessage}
            className="mb-1.5 cursor-pointer bg-violet-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <BiSend />
          </button>
          <VoiceRecorderBtn isRecordingHandler={(e)=>{setIsRecording(e)}} id={id}/>
        

          <button className="mb-1.5 bg-violet-600 text-white rounded-full p-3 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            <BiCamera />
          </button>
          <FileUploader reloadData={reloadData} type={type} id={id} />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

