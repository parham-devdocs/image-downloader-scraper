"use client";
import { ReactElement, useRef, useState, PointerEvent } from 'react';
import { BiCamera, BiLock, BiMicrophone, BiSend } from 'react-icons/bi';
import { RiArrowUpSLine } from "react-icons/ri";
import VoiceRecorder from './voiceRecorder';
import { CgAttachment } from 'react-icons/cg';
import { Unlock } from 'next/font/google';
import { BsUnlock } from 'react-icons/bs';

type ChatInputProps = { 
  inputValue: string, 
  onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  sendMessage: () => void 
};

const ChatInput = ({ inputValue, onChangeHandler, sendMessage }: ChatInputProps) => {
  const [recordingState, setRecordingState] = useState<"Idle" | "Holding" | "Locked">("Idle");
  const startY = useRef(0);
  
  const isRecording = recordingState !== "Idle";
  const isLocked = recordingState === "Locked";

  const handlePointerDown = (e: PointerEvent) => {
    setRecordingState("Holding");
    startY.current = e.clientY;
    console.log("Started Recording");
  };

  const handlePointerMove = (e: PointerEvent) => {
    console.log({clientY:e.clientY,startY:startY.current})
    if (recordingState === 'Holding' && startY.current - e.clientY < 50 ) {
      setRecordingState("Locked");
      console.log('Locked to Record!');
    }
  };

  const handlePointerUp = () => {
    // If locked, we stay in locked state (don't stop recording)
    if (recordingState === "Locked") return;

    // If just holding, we stop and send
    setRecordingState("Idle");
    console.log("Stopped Recording - Sending Audio");
  };

  // If clicked while locked, we want to stop and send
  const handleStopRecording = () => {
      setRecordingState("Idle");
      console.log("Stop button clicked - Sending Audio");
  };
 return (
    <div className="border-t w-full border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-4 ">
    <div className="w-full mx-auto">
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 min-w-0">
            {isRecording ? <VoiceRecorder/> :   <input
            value={inputValue}
            onChange={onChangeHandler}
           
            placeholder="Type a message..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 focus:bg-white transition-all duration-200 resize-none"
          />}
        
        </div>
        <button 
          type="submit" 
          onClick={sendMessage} 
          className="mb-1.5 cursor-pointer bg-violet-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <BiSend/>
        </button>
        <div className=' flex flex-col relative'>
            {isRecording && !isLocked && <HoldingBtn/> }
{isLocked && <LockedBtn handleStopRecording={handleStopRecording} /> }
        <button onPointerDown={handlePointerDown} onMouseMove={(e:any)=>handlePointerMove(e)} onPointerUp={handlePointerUp} className="mb-1.5 cursor-pointer bg-violet-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
          <BiMicrophone/>
        </button>
        </div>
       
        <button className="mb-1.5 bg-violet-600 text-white rounded-full p-3 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
          <BiCamera/>
        </button>
        <FileUploader/>
      </div>
    </div>
  </div>  )
}
            
export default ChatInput


import React from 'react'
import FileUploader from './FileUploader';

const HoldingBtn = () => {
  return (
<div className=' absolute flex flex-col items-center opacity-90 -top-18 left-1 bg-violet-500 py-3 px-2 text-white rounded-full  '>
<RiArrowUpSLine className=' animate-bounce' size={20}/>
<BiLock/>       </div>  )
}



const LockedBtn=({handleStopRecording}:{handleStopRecording:()=>void})=>{
  return(
    <button onClick={handleStopRecording} className=' cursor-pointer absolute flex flex-col items-center opacity-90 -top-13 left-1 bg-violet-500 py-3 px-2 text-white rounded-full '>
    <BsUnlock />
</button> 
  )
}