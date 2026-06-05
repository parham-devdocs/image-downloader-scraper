

import React from 'react'
import SeenComponent from './seen'
import formatTime from '@/app/utils/formatTime'

const FileBubble = ({isOwn,downloaded,filename,size,createdAt,seen}:{isOwn:boolean,filename:string,size:string,downloaded:boolean,createdAt:string,seen:boolean}) => {
  return (
    <div className="flex flex-col max-w-[70%] relative scale-100 starting:scale-0  opacity-100 transition-all duration-700 ease-out starting:opacity-0">
          
    <div
      className={`
        px-4 py-2
        rounded-2xl
        text-sm
        shadow-sm
        break-words
        ${
          isOwn
            ?  "bg-violet-600 text-white rounded-br-md"
            :"bg-slate-200 text-slate-900 rounded-bl-md"
        }
      `}
    >
      <div className=' w-full h-full bg-amber-600'></div>  


    </div>

    {createdAt && (
      <span
        className={`text-[11px] mt-1 ${
          isOwn ?"text-slate-400"  : "text-right text-slate-400"
        }`}
      >
        {formatTime(createdAt)}
      </span>
    )}
   {!isOwn &&  <div className=" absolute bottom-5 right-1"><SeenComponent isOwn={isOwn} seen={seen}/></div>} 
  </div>
)
}

export default FileBubble