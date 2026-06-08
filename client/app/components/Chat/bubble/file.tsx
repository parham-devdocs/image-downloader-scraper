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
 
  FaExclamationTriangle
} from 'react-icons/fa'
import { MdInsertDriveFile } from 'react-icons/md'
import { Message } from '@/types'
import FileDownloadBtn from './fileDownloadBtn'

type FileBubbleType = Omit<Message, 'content' | 'type'|"_id" | 'sender'> & Required<Pick<Message, "isOwn">> & {id:string}

const FileBubble = ({ 
  isOwn, 
  seen,
  file,
 id
}: FileBubbleType) => {
  
  const [isDownloading, setIsDownloading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [downloadFailed, setDownloadFailed] = useState(false)
  const downloadedRef = useRef(false)
console.log({isOwn,seen,file,id})
  // Validate file object
  const isValidFile = file && file.url && file.filename && file.size
  
  // If file is invalid or missing, don't render anything
  if (!isValidFile) {
    console.error('Invalid file data:', file)
    return null // Return nothing, no empty space
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

  const handleDownload = async () => {
    setIsDownloading(true)
    setHasError(false)
    setDownloadFailed(false)
    
    try {
      // Your actual download logic here
      // For example: await downloadFile(file.url)
      
      // Simulate download success/failure for demo
      const success = await simulateDownload()
      
      if (success) {
        downloadedRef.current = true
      } else {
        setDownloadFailed(true)
      }
    } catch (error) {
      setDownloadFailed(true)
      setHasError(true)
    } finally {
      setIsDownloading(false)
    }
  }

  // Simulate download for demo (remove in production)
  const simulateDownload = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Random success/failure for demo
        resolve(Math.random() > 0.3)
      }, 1500)
    })
  }

  // If download failed, show error message (optional - can return null to hide completely)
  if (downloadFailed && !isDownloading) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-2 `}>
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-2 px-3 max-w-[250px]">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500 text-sm" />
            <span className="text-xs text-red-700 dark:text-red-300">
              Failed to load {file.filename}
            </span>
            <button 
              onClick={handleDownload}
              className="text-xs text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
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
          
          hover:shadow-xl
          scale-100 starting:scale-0  opacity-100 transition-all duration-700 ease-out starting:opacity-0
         ${
          isOwn
            ?  "bg-violet-600 text-white rounded-br-md text-left"
            :"bg-slate-200 text-slate-900 rounded-bl-md"
        }
          ${hasError ? 'opacity-60' : ''}
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
            <p className='font-semibold truncate mb-1 text-sm' title={file.filename}>
              {file.filename}
            </p>
            <div className='flex items-center gap-2 text-xs opacity-75'>
              <span className="font-mono">{formatFileSize(file.size)}</span>
              
              {hasError && !isDownloading && (
                <span className='flex items-center gap-1'>
                  <FaExclamationTriangle className='text-[10px] text-red-500' />
                  <span className="text-red-500">Failed</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Download Button with Animation */}
         <FileDownloadBtn url={file.url} isOwn={isOwn} onError={() => setHasError(true)} id={id}/> 
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
      {!isOwn &&  <div className=" absolute bottom-5 right-1"><SeenComponent isOwn={isOwn} seen={seen}/></div>} 

      {/* Ripple Effect on Hover for Own Messages */}
      {isOwn && isHovered && (
        <div className="absolute inset-0 rounded-2xl animate-ping-slow pointer-events-none" />
      )}
    </div>
  )
}

export default FileBubble