import React, { JSX, useRef, useState } from 'react'
import SeenComponent from './seen'
import formatTime from '@/app/utils/formatTime'
import { 
  FaFolder, 
  FaCheck, 
  FaCheckDouble, 
  FaFileAlt, 
  FaFilePdf, 
  FaFileImage, 
  FaFileVideo, 
  FaFileAudio, 
  FaFileArchive,
  FaCloudDownloadAlt,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa'
import { MdInsertDriveFile } from 'react-icons/md'
import Link from 'next/link'
import {  Message } from '@/types'
type FileBubbleType= Omit<Message, 'content' | 'type' | 'sender'> & Required<Pick<Message ,"isOwn">>
const FileBubble = ({ 
  isOwn, 
  seen ,
  file
}: FileBubbleType) => {
  
  const [isDownloading, setIsDownloading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
const downloadedRef=useRef(false)
  // Format file size
  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes)
    if (isNaN(size)) return bytes
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  // Get file icon based on extension
  const getFileIcon = () => {
    const extension = file?.filename.split('.').pop()?.toLowerCase() || ''
    
    const iconMap: { [key: string]: { icon: JSX.Element; color: string } } = {
      pdf: { icon: <FaFilePdf />, color: 'text-red-500' },
      jpg: { icon: <FaFileImage />, color: 'text-blue-500' },
      jpeg: { icon: <FaFileImage />, color: 'text-blue-500' },
      png: { icon: <FaFileImage />, color: 'text-blue-500' },
      gif: { icon: <FaFileImage />, color: 'text-purple-500' },
      webp: { icon: <FaFileImage />, color: 'text-green-500' },
      mp4: { icon: <FaFileVideo />, color: 'text-indigo-500' },
      mov: { icon: <FaFileVideo />, color: 'text-indigo-500' },
      avi: { icon: <FaFileVideo />, color: 'text-indigo-500' },
      mp3: { icon: <FaFileAudio />, color: 'text-pink-500' },
      wav: { icon: <FaFileAudio />, color: 'text-pink-500' },
      zip: { icon: <FaFileArchive />, color: 'text-yellow-600' },
      rar: { icon: <FaFileArchive />, color: 'text-yellow-600' },
      '7z': { icon: <FaFileArchive />, color: 'text-yellow-600' },
      doc: { icon: <MdInsertDriveFile />, color: 'text-blue-600' },
      docx: { icon: <MdInsertDriveFile />, color: 'text-blue-600' },
      xls: { icon: <MdInsertDriveFile />, color: 'text-green-600' },
      xlsx: { icon: <MdInsertDriveFile />, color: 'text-green-600' },
      ppt: { icon: <MdInsertDriveFile />, color: 'text-orange-600' },
      pptx: { icon: <MdInsertDriveFile />, color: 'text-orange-600' },
    }
    
    return iconMap[extension] || { icon: <FaFileAlt />, color: 'text-gray-500' }
  }

  const fileIcon = getFileIcon()
  const isLargeFile = parseInt(file?.size) > 10 * 1024 * 1024 // 10MB

  const handleDownload = async () => {
    setIsDownloading(true)
    // Simulate download or implement actual download logic
    setTimeout(() => {
      setIsDownloading(false)
    }, 1500)
  }

  return (
    <Link 
    download={file.url}
    href={file.url}
      className={`flex flex-col max-w-[80%] relative group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isOwn ? 'items-end ml-auto' : 'items-start'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Bubble Container */}
      <div
        className={`
          relative px-4 py-3
          rounded-2xl
          text-sm
          shadow-md
          break-words
          transition-all
          duration-300
          hover:shadow-xl
          hover:scale-[1.02]
          ${isOwn 
            ? "bg-gradient-to-br from-violet-500 to-violet-700 text-white rounded-br-md" 
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700"
          }
        `}
      >
        
        {/* File Content */}
        <div className='flex items-center gap-4 min-w-[220px]'>
          {/* Animated File Icon */}
          <div className={`
            relative text-3xl transition-transform duration-300
            ${isHovered ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}
            ${fileIcon.color}
          `}>
            {fileIcon.icon}
            {isLargeFile && (
              <span className="absolute -top-2 -right-2 text-[8px] bg-red-500 text-white rounded-full px-1">
                BIG
              </span>
            )}
          </div>
          
          {/* File Info */}
          <div className='flex-1 min-w-0'>
            <p className='font-semibold truncate mb-1 text-sm' title={file?.filename}>
              {file?.filename}
            </p>
            <div className='flex items-center gap-2 text-xs opacity-75'>
              <span className="font-mono">{formatFileSize(file?.size)}</span>
              {downloadedRef && (
                <span className='flex items-center gap-1 animate-in fade-in duration-300'>
                  <FaCheckCircle className='text-[10px] text-green-500' />
                  <span className="text-green-500 dark:text-green-400">Downloaded</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Download Button with Animation */}
          {!downloadedRef && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                transition-all duration-300 transform
                ${isOwn 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900'
                }
                ${isHovered ? 'scale-110' : 'scale-100'}
                ${isDownloading ? 'animate-pulse' : ''}
              `}
            >
              {isDownloading ? (
                <FaSpinner className='text-sm animate-spin' />
              ) : (
                <FaCloudDownloadAlt className='text-base' />
              )}
            </button>
          )}
          
          {/* Downloaded Badge */}
          {downloadedRef && (
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isOwn 
                ? 'bg-white/20 text-white' 
                : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-600 dark:text-green-400'
              }
              ${isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
            `}>
              <FaFolder className='text-base' />
            </div>
          )}
        </div>

        {/* Progress Bar (Optional - for downloads) */}
        {isDownloading && (
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full animate-progress"
              style={{ width: '60%' }}
            />
          </div>
        )}
      </div>

      {/* Timestamp and Status with Enhanced Styling */}
      {file?.createdAt && (
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span className='text-[10px] font-mono text-gray-400 dark:text-gray-500 transition-opacity duration-200 group-hover:opacity-100 opacity-70'>
            {formatTime(file?.createdAt)}
          </span>
          
          {/* Seen/Read Status for Own Messages with Animation */}
          {isOwn && (
            <span className='text-[10px] transition-transform duration-200 group-hover:scale-110'>
              {seen ? (
                <FaCheckDouble className='text-blue-400 animate-in fade-in duration-300' />
              ) : (
                <FaCheck className='text-gray-400' />
              )}
            </span>
          )}
        </div>
      )}
      
      {/* Seen Component for Others' Messages */}
      {!isOwn && seen && (
        <div className="absolute -bottom-2 -right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <SeenComponent isOwn={isOwn} seen={seen} />
        </div>
      )}

      {/* Ripple Effect on Hover for Own Messages */}
      {isOwn && isHovered && (
        <div className="absolute inset-0 rounded-2xl animate-ping-slow pointer-events-none" />
      )}
    </Link>
  )
}

export default FileBubble