import React from 'react'
import SeenComponent from './seen'
import formatTime from '@/app/utils/formatTime'
import { FaFolder, FaDownload, FaCheck, FaCheckDouble } from 'react-icons/fa'

const FileBubble = ({ 
  isOwn, 
  filename, 
  size, 
  downloaded, 
  createdAt, 
  seen 
}: { 
  isOwn: boolean, 
  filename: string, 
  size: string, 
  downloaded: boolean, 
  createdAt: string, 
  seen: boolean 
}) => {

  // Format file size
  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes)
    if (isNaN(size)) return bytes
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={`flex flex-col max-w-[70%] relative group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
      isOwn ? 'items-end ml-auto' : 'items-start'
    }`}>
      
      {/* Bubble Container */}
      <div
        className={`
          relative px-4 py-3
          rounded-2xl
          text-sm
          shadow-md
          break-words
          transition-all
          duration-200
          hover:shadow-lg
          ${isOwn 
            ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-md" 
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700"
          }
        `}
      >
        
        {/* File Content */}
        <div className='flex items-center gap-3 min-w-[200px]'>
          {/* File Icon */}
          
          
          {/* File Info */}
          <div className='flex-1 min-w-0'>
            <p className='font-medium truncate mb-0.5' title={filename}>
              {filename}
            </p>
            <div className='flex items-center gap-2 text-xs opacity-70'>
              <span>{formatFileSize(size)}</span>
              {downloaded && (
                <span className='flex items-center gap-1'>
                  <FaDownload className='text-[10px]' />
                  <span>Downloaded</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Download Status Icon */}
          {downloaded && (
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${isOwn 
                ? 'bg-violet-500 text-white' 
                : 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300'
              }
            `}>
              <FaFolder className='text-sm' />
            </div>
          )}
        </div>
      </div>

      {/* Timestamp and Status */}
      {createdAt && (
        <div className={`flex items-center gap-2 mt-1 px-1 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span className='text-[10px] text-gray-400 dark:text-gray-500'>
            {formatTime(createdAt)}
          </span>
          
          {/* Seen/Read Status for Own Messages */}
          {isOwn && (
            <span className='text-[10px]'>
              {seen ? (
                <FaCheckDouble className='text-blue-400' />
              ) : (
                <FaCheck className='text-gray-400' />
              )}
            </span>
          )}
        </div>
      )}
      
      {/* Seen Component for Others' Messages - Positioned absolutely */}
      {!isOwn && seen && (
        <div className="absolute -bottom-1 -right-8">
          <SeenComponent isOwn={isOwn} seen={seen} />
        </div>
      )}
    </div>
  )
}

export default FileBubble