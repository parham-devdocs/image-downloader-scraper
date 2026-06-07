// FileDownloadBtn.tsx
import UseDownloadFile from '@/app/hooks/useDownloadFile'
import React from 'react'
import { FaCloudDownloadAlt, FaFolder, FaSpinner } from 'react-icons/fa'

// Fix the type definition - make id optional or remove it if not needed
interface FileDownloadBtnProps {
    isOwn: boolean
    url: string
    type?: "chat" | "group"  // Made optional with default
    id?: string  // Made optional since it might not be needed
    onError?: () => void
}

const FileDownloadBtn = ({ 
    isOwn, 
    url, 
    type = "chat",  // Default value
    id,  // Keep but don't pass to hook if not needed
    onError 
}: FileDownloadBtnProps) => {
    // Don't pass id to UseDownloadFile if it doesn't use it
    const { isDownloading, getFile, loadingPercentage, isDownloaded } = UseDownloadFile({ 
        url, 
        id: id || url  // Provide fallback if id is required
    })
    
    async function handleDownload() {
        try {
            await getFile()
            if (onError) onError()
        } catch (error) {
            console.error('Download failed:', error)
            if (onError) onError()
        }
    }
    
    return (
        <div className="relative flex items-center gap-2">
            {/* Download Button - Show when not downloaded */}
            {!isDownloaded && (
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                        transition-all duration-300 transform
                        hover:scale-110
                        ${isOwn 
                            ? 'bg-white/20 hover:bg-white/30 text-white' 
                            : 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900'
                        }
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
            
            {/* Downloaded Badge - Show when downloaded */}
            {isDownloaded && (
                <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isOwn 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-600 dark:text-green-400'
                    }
                `}>
                    <FaFolder className='text-base' />
                </div>
            )}
            
            {/* Loading Percentage Indicator */}
            {isDownloading && loadingPercentage > 0 && loadingPercentage < 100 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded-full whitespace-nowrap">
                    {loadingPercentage}%
                </div>
            )}
        </div>
    )
}

export default FileDownloadBtn