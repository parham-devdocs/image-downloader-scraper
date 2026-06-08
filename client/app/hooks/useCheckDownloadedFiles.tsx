

import React, { useEffect, useState } from 'react'

const useCheckDownloadedFiles = ({url}:{url:string}) => {
    const [isDownloaded,setIsDownloaded]=useState(false)
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

    function saveToLocalStorage() {
        const downloadedFiles = localStorage.getItem('downloadedFiles')
        const files = downloadedFiles ? JSON.parse(downloadedFiles) : []
        if (!files.includes(url)) {
            files.push(url)
            localStorage.setItem('downloadedFiles', JSON.stringify(files))
        }
    }
return {saveToLocalStorage,isDownloaded,setIsDownloaded}
}

export default useCheckDownloadedFiles