"use client"

import useStream from '@/app/hooks/useStream';
import { ParamValue } from 'next/dist/server/request/params';
import  {  useEffect, useRef, useState } from 'react'
import { BiLock, BiMicrophone } from 'react-icons/bi';
import { BsUnlock } from 'react-icons/bs';
import { RiArrowUpSLine } from 'react-icons/ri';

const VoiceRecorderBtn = ({isRecordingHandler,id}:{isRecordingHandler:(e:boolean)=>void,id:ParamValue}) => {
  const [recordingState, setRecordingState] = useState<
  "Idle" | "Holding" | "Locked"
>("Idle");
const startY = useRef(0);
const isRecording = recordingState !== "Idle";
const isLocked = recordingState === "Locked";

const {   
  
  audioChunks,
  startStreaming,
  stopStreaming,
  clearChunks}=useStream(id)



const handlePointerDown = (e: React.MouseEvent<HTMLButtonElement>) => {
  setRecordingState("Holding");
  isRecordingHandler(true)
  startY.current = e.clientY;
  startStreaming()
  console.log("Started Recording");
};

const handlePointerMove = (e:React.MouseEvent<HTMLButtonElement>) => {
  console.log({ clientY: e.clientY, startY: startY.current });
  if (recordingState === "Holding" && startY.current - e.clientY < 50) {
    setRecordingState("Locked");
    console.log("Locked to Record!");
  }
};

const handlePointerUp = () => {
  // If locked, we stay in locked state (don't stop recording)
  if (recordingState === "Locked") return;
isRecordingHandler(false)
  // If just holding, we stop and send
  stopStreaming()
  clearChunks()
  setRecordingState("Idle");
  console.log("Stopped Recording - Sending Audio");
};

// If clicked while locked, we want to stop and send
const handleStopRecording = () => {
  setRecordingState("Idle");
  console.log("Stop button clicked - Sending Audio");
};
  return (
    <div className=" flex flex-col relative">
    {isRecording && !isLocked && <HoldingBtn />}
    {isLocked && (
      <LockedBtn handleStopRecording={handleStopRecording} />
    )}
    <button
      onPointerDown={(e)=>handlePointerDown(e)}
      onMouseMove={(e: React.MouseEvent<HTMLButtonElement>) => handlePointerMove(e)}
      onPointerUp={handlePointerUp}
      className="mb-1.5 cursor-pointer bg-violet-600 text-white rounded-full p-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <BiMicrophone />
    </button>
  </div>  )
}

export default VoiceRecorderBtn



const HoldingBtn = () => {
  return (
    <div className=" absolute flex flex-col items-center opacity-90 -top-18 left-1 bg-violet-500 py-3 px-2 text-white rounded-full  ">
      <RiArrowUpSLine className=" animate-bounce" size={20} />
      <BiLock />{" "}
    </div>
  );
};

const LockedBtn = ({
  handleStopRecording,
}: {
  handleStopRecording: () => void;
}) => {
  return (
    <button
      onClick={handleStopRecording}
      className=" cursor-pointer absolute flex flex-col items-center opacity-90 -top-13 left-1 bg-violet-500 py-3 px-2 text-white rounded-full "
    >
      <BsUnlock />
    </button>
  );
};
