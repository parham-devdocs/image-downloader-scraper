"use client"
import { useState, useEffect, useCallback } from "react"
import apiClient from "../axios"
import useCheckDownloadedFiles from "./useCheckDownloadedFiles";
import { AxiosError } from "axios";

interface DownloadOptions {
    url: string;
    onProgress?: (progress: number) => void;
    groupOrChatId: string
}

const UseDownloadFile = ({ url, onProgress, groupOrChatId }: DownloadOptions) => {
    const [loadingPercentage, setLoadingPercentage] = useState(0)
    const [isDownloading, setIsDownloading] = useState(false)
    const { saveToLocalStorage, isDownloaded, setIsDownloaded } = useCheckDownloadedFiles({ url })
const [error,setError]=useState(null)
    async function downloadFile(): Promise<void> {
        if (isDownloaded) {
            console.log('File already downloaded')
            return
        }
        
        setIsDownloading(true)
        setLoadingPercentage(0)
        
        try {
            // Get the filename from URL
            const fileName = url.split('/').pop() || 'download'
            
            // IMPORTANT: Set responseType to 'blob'
            const response = await apiClient.get(
                `http://localhost:5000/api/file/${url}/${groupOrChatId}`,
                {
                    responseType: 'blob', // This is critical for binary data
                    onDownloadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setLoadingPercentage(percent);
                            if (onProgress) onProgress(percent);
                        }
                    }
                }
            )
            
            // Create blob link to download
            const blob = new Blob([response.data])
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)
            
            // Mark as downloaded
            setIsDownloaded(true)
            saveToLocalStorage()
            
        } catch (error:any) {
            console.error('Download error:', error)
            setError(error)
            throw error
        } finally {
            setIsDownloading(false)
            setLoadingPercentage(0)
        }
    }

    // Stream download version (better for large files)
    async function downloadFileAsStream(): Promise<void> {
        if (isDownloaded) {
            console.log('File already downloaded')
            return
        }
        
        setIsDownloading(true)
        setLoadingPercentage(0)
        
        try {
            const fileName = url.split('/').pop() || 'download'
            
            const response = await fetch(`http://localhost:5000/api/file/${url}/${groupOrChatId}`)
            
            if (!response.ok) throw new Error('Download failed')
            
            const contentLength = response.headers.get('content-length')
            const total = parseInt(contentLength || '0')
            
            const reader = response.body?.getReader()
            const chunks: Uint8Array[] = []
            let receivedLength = 0
            
            while (reader) {
                const { done, value } = await reader.read()
                
                if (done) break
                
                chunks.push(value)
                receivedLength += value.length
                
                if (total) {
                    const percent = Math.round((receivedLength * 100) / total)
                    setLoadingPercentage(percent)
                    if (onProgress) onProgress(percent)
                }
            }
            
            // Combine chunks and download
            const blob = new Blob(chunks)
            const downloadUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(downloadUrl)
            
            setIsDownloaded(true)
            saveToLocalStorage()
            
        } catch (error:any) {
            setError(error)
            console.error('Stream download error:', error)
        } finally {
            setIsDownloading(false)
            setLoadingPercentage(0)
        }
    }

    const getFile = useCallback(async (): Promise<void> => {
        try {
            await downloadFile()
        } catch (error) {
            console.error('Failed to get file:', error)
        }
    }, [url, groupOrChatId])

    const clearDownloadedStatus = useCallback(() => {
        const downloadedFiles = localStorage.getItem('downloadedFiles')
        if (downloadedFiles) {
            const files = JSON.parse(downloadedFiles)
            const filteredFiles = files.filter((fileUrl: string) => fileUrl !== url)
            localStorage.setItem('downloadedFiles', JSON.stringify(filteredFiles))
            setIsDownloaded(false)
        }
    }, [url])

    return {
        getFile,
        downloadFileAsStream,
        isDownloading,
        loadingPercentage,
        isDownloaded,
        clearDownloadedStatus,
        setIsDownloaded,
        setIsDownloading,
        error
    }
}

export default UseDownloadFile