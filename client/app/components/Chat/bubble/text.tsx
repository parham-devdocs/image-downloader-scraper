import React from 'react'
import SeenComponent from './seen'
import formatTime from '@/app/utils/formatTime'

const TextBubble = ({isOwn, content, createdAt, seen, username}: {isOwn: boolean, content: string, createdAt: string, username?: string, seen: boolean}) => {
  return (
    <div className="flex flex-col relative scale-100 starting:scale-0 opacity-100 transition-all duration-700 ease-out starting:opacity-0">
      {/* Username - only show for other users and only if username exists */}
      {!isOwn && username && (
        <p className="text-[11px] text-slate-500 mb-1 ml-2">{username}</p>
      )}

      {/* Message bubble */}
      <div
        className={`
          px-16
          py-2.5
          max-w-[80%]
          rounded-2xl
          text-sm
          shadow-sm
        
          whitespace-pre-wrap
          ${isOwn 
            ? "bg-violet-600 text-white rounded-br-md ml-auto" 
            : "bg-slate-100 text-slate-900 rounded-bl-md"
          }
        `}
      >
        {content}
      </div>

      {/* Timestamp and seen status */}
      <div className={`flex items-center  mt-1 ${isOwn ? "justify-end" : "justify-start ml-2"}`}>
      {!isOwn && <SeenComponent isOwn={isOwn} seen={seen} />}

        {createdAt && (
          <span className="text-[10px] text-slate-400">
            {formatTime(createdAt)}
          </span>
        )}
      </div>
    </div>
  )
}

export default TextBubble