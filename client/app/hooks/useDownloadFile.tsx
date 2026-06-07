"use client"
import { useState, useEffect, useCallback } from "react"
import apiClient from "../axios"

interface DownloadOptions {
    url: string;
    onProgress?: (progress: number) => void;
    id:string
}

const UseDownloadFile = ({ url, onProgress,id }: DownloadOptions) => {
    const [isDownloaded, setIsDownloaded] = useState(false)
    const [loadingPercentage, setLoadingPercentage] = useState(0)
    const [isDownloading, setIsDownloading] = useState(false)

    // Check localStorage for existing downloads on mount
    useEffect(() => {
        const checkDownloadedStatus = () => {
            const downloadedFiles = localStorage.getItem('downloadedFiles')
            if (downloadedFiles) {
                const files = JSON.parse(downloadedFiles)
                if (files.includes(url)) {
                    setIsDownloaded(true)
                }
            }
        }
        
        checkDownloadedStatus()
    }, [url])

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
            
            // Make the request with blob response type
            console.log({url,id})

            const response = await apiClient.get(`http://localhost:5000/api/file/${url}/${id}` )
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
            
            // Save to localStorage
            const downloadedFiles = localStorage.getItem('downloadedFiles')
            const files = downloadedFiles ? JSON.parse(downloadedFiles) : []
            if (!files.includes(url)) {
                files.push(url)
                localStorage.setItem('downloadedFiles', JSON.stringify(files))
            }
            
        } catch (error) {
            console.error('Download error:', error)
            throw error
        } finally {
            setIsDownloading(false)
            setLoadingPercentage(0)
        }
    }

    // Optional: Stream download for large files
    async function downloadFileAsStream(): Promise<void> {
        if (isDownloaded) {
            console.log('File already downloaded')
            return
        }
        
        setIsDownloading(true)
        setLoadingPercentage(0)
        
        try {
            const fileName = url.split('/').pop() || 'download'
            
            const response = await fetch(`http://localhost:5000/api/file/${encodeURIComponent(url)}`)
            
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
            link.click()
            URL.revokeObjectURL(downloadUrl)
            
            setIsDownloaded(true)
            
            // Save to localStorage
            const downloadedFiles = localStorage.getItem('downloadedFiles')
            const files = downloadedFiles ? JSON.parse(downloadedFiles) : []
            if (!files.includes(url)) {
                files.push(url)
                localStorage.setItem('downloadedFiles', JSON.stringify(files))
            }
            
        } catch (error) {
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
    }, [url])

    // Clear downloaded status
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
        downloadFileAsStream, // Export stream version if needed
        isDownloading,
        loadingPercentage,
        isDownloaded,
        clearDownloadedStatus
    }
}

export default UseDownloadFile