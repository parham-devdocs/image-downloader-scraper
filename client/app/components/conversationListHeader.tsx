"use client"
import React, { useEffect, useState } from "react"
import { BiSearch } from "react-icons/bi"
import { CiSettings } from "react-icons/ci"
import Avatar from "./avatar"

const ChatListHeader = () => {
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false)
  const [internetConnection, setInternetConnection] = useState(true)

  useEffect(() => {
    const updateStatus = () => {
      setInternetConnection(navigator.onLine)
    }

    updateStatus()

    const interval = setInterval(updateStatus, 2000)

    window.addEventListener("online", updateStatus)
    window.addEventListener("offline", updateStatus)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", updateStatus)
      window.removeEventListener("offline", updateStatus)
    }
  }, [])

  return (
    <div className="w-full h-28 bg-violet-600 relative mb-6 px-3 pt-2">

      {/* top row */}
      <div className="flex items-center justify-between">

        {/* search */}
        <div
          className={`flex items-center bg-white rounded-full overflow-hidden transition-all duration-300
          ${isSearchBarOpen ? "w-full px-2 py-1" : "w-8 h-8 justify-center"}`}
        >
          <BiSearch
            className="text-violet-600 text-xl cursor-pointer"
            onClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
          />

          <input
            type="text"
            placeholder="Search ID..."
            className={`ml-2 outline-none text-sm bg-transparent w-full
            ${isSearchBarOpen ? "block" : "hidden"}`}
          />
        </div>

        {/* settings */}
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer">
          <CiSettings className="text-white text-xl" />
        </div>
      </div>

      {/* user row */}
      <div className="flex justify-between items-center mt-6 pl-1 pr-1">

        <p className="text-white font-semibold underline underline-offset-4">
          John Doe
        </p>

        <div
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300
          ${internetConnection
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700 animate-pulse"}`}
        >
          {internetConnection ? "Online" : "Connecting..."}
        </div>
      </div>

      {/* avatar (unchanged half-hidden circle) */}
      <div className="w-14 h-14 bg-violet-600 absolute top-20 left-28 rounded-full">
       <Avatar filename="user" url=""/>
      </div>
     

    </div>
  )
}

export default ChatListHeader
