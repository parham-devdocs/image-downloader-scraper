// FileBubble.tsx - Updated version
import React, { JSX, useRef, useState } from 'react'
import SeenComponent from './seen'
import formatTime from '@/app/utils/formatTime'
import { 
  FaFileAlt, 
  FaFilePdf, 
  FaFileImage, 
  FaFileVideo, 
  FaFileAudio, 
  FaFileArchive,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa'
import { MdInsertDriveFile } from 'react-icons/md'
import { Attachment, Message } from '@/types'
import FileDownloadBtn from './fileDownloadBtn'


const FileBubble = ({ 
  isOwn, 
  seen,
  file,
  username,
  id
}: {isOwn:boolean,seen:boolean,file:Attachment,username:string,id:string}) => {
  
  const [isHovered, setIsHovered] = useState(false)
  const [downloadError, setDownloadError] = useState(false)
  const [isFileDownloaded, setIsFileDownloaded] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  
  console.log({isOwn, seen, file, id})
  
  // Validate file object
  const isValidFile = file && file.url && file.filename && file.size
  
  // If file is invalid or missing, don't render anything
  if (!isValidFile) {
    console.error('Invalid file data:', file)
    return null
  }

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
    const extension = file?.filename?.split('.').pop()?.toLowerCase() || ''
    
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
  const isLargeFile = parseInt(file.size) > 10 * 1024 * 1024 // 10MB

  const handleDownloadStateChange = (isDownloaded: boolean, hasError?: boolean) => {
    setIsFileDownloaded(isDownloaded)
    if (hasError) {
      setDownloadError(true)
    } else {
      setDownloadError(false)
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    setDownloadError(false)
    // The retry will be handled by the FileDownloadBtn when clicked
    setTimeout(() => setIsRetrying(false), 1000)
  }

  // Show different UI based on download state
  const renderFileStatus = () => {
    if (isFileDownloaded) {
      return (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <FaCheckCircle className="text-xs" />
          <span>Downloaded</span>
        </div>
      )
    }
    
    if (downloadError) {
      return (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleRetry}
            className="text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
            disabled={isRetrying}
          >
            {isRetrying ? 'Retrying...' : 'Download failed - Click to retry'}
          </button>
        </div>
      )
    }
    
    return null
  }

  return (
    <div
      className={`flex flex-col max-w-[80%] relative group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isOwn ? 'items-end ml-auto' : 'items-start'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {!isOwn && username && (
        <p className="text-[11px] text-slate-500 mb-1 ml-2">{username}</p>
      )}
      {/* Bubble Container */}
      <div
        className={`
          relative px-4 py-3
          rounded-2xl
          text-sm
          shadow-md
          hover:shadow-xl
          scale-100 starting:scale-0 opacity-100 transition-all duration-700 ease-out starting:opacity-0
          ${downloadError ? 'opacity-90' : ''}
          ${
            isOwn
              ? "bg-violet-600 text-white rounded-br-md text-left"
              : "bg-slate-200 text-slate-900 rounded-bl-md"
          }
        `}
      >
       
        {/* File Content */}
        <div className='flex items-center gap-4 min-w-[220px]'>
          {/* Animated File Icon */}
          <div className={`
            relative text-3xl transition-transform duration-300
            ${isHovered && !isFileDownloaded ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}
            ${isFileDownloaded ? 'opacity-70' : fileIcon.color}
          `}>
            {fileIcon.icon}
            {isLargeFile && !isFileDownloaded && (
              <span className="absolute -top-2 -right-2 text-[8px] bg-red-500 text-white rounded-full px-1">
                BIG
              </span>
            )}
            {isFileDownloaded && (
              <span className="absolute -top-2 -right-2 text-[10px] bg-green-500 text-white rounded-full p-0.5">
                <FaCheckCircle className="text-[8px]" />
              </span>
            )}
          </div>
          
          {/* File Info */}
          <div className='flex-1 min-w-0'>
            <p className={`font-semibold truncate mb-1 text-sm ${isFileDownloaded ? 'opacity-70' : ''}`} title={file.filename}>
              {file.filename}
            </p>
            <div className='flex items-center gap-2 text-xs opacity-75'>
              <span className="font-mono">{formatFileSize(file.size)}</span>
              {isFileDownloaded && (
                <span className="text-green-500 dark:text-green-400">✓</span>
              )}
            </div>
          </div>
          
          {/* Download Button */}
          <FileDownloadBtn 
            url={file.url} 
            isOwn={isOwn} 
            onError={() => setDownloadError(true)} 
            id={id}
            onDownloadStateChange={handleDownloadStateChange}
          /> 
        </div>

        {/* Status Message */}
        {renderFileStatus()}
      </div>

      {/* Timestamp and Status */}
      {file.createdAt && (
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span className='text-[10px] font-mono text-gray-400 dark:text-gray-500 transition-opacity duration-200 group-hover:opacity-100 opacity-70'>
            {formatTime(file.createdAt)}
          </span>
        </div>
      )}
      
      {/* Seen Component for Others' Messages */}
      {!isOwn && <div className="absolute bottom-5 right-1"><SeenComponent isOwn={isOwn} seen={seen}/></div>} 

      {/* Ripple Effect on Hover for Own Messages */}
      {isOwn && isHovered && (
        <div className="absolute inset-0 rounded-2xl animate-ping-slow pointer-events-none" />
      )}
    </div>
  )
}

export default FileBubble