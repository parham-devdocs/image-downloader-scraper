"use client"

import React, { useState } from 'react'

interface ConversationListTabProps {
    onTabChangeHandler: (tab: "Groups" | "Chats") => void
}

const ConversationListTab = ({ onTabChangeHandler }: ConversationListTabProps) => {
    const [activeTab, setActiveTab] = useState<"Groups"|"Chats">("Groups")
    
    const handleTabChange = (tab: "Groups"|"Chats") => {
        setActiveTab(tab)
        onTabChangeHandler(tab)
    }
    
    return (
        <div className='w-full flex gap-1 items-center justify-center p-1 rounded-lg'>
            <button
                onClick={() => handleTabChange("Groups")}
                className={`
                    relative px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 cursor-pointer
                    ${activeTab === "Groups" 
                        ? 'bg-violet-600/10 border-b-2 border-violet-500 text-violet-400' 
                        : 'border-b-2 border-transparent text-gray-400 '
                    }
                `}
            >
                Groups
                {activeTab === "Groups" && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full" />
                )}
            </button>
            <button
                onClick={() => handleTabChange("Chats")}
                className={`
                    relative px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 cursor-pointer
                    ${activeTab === "Chats" 
                        ? 'bg-violet-600/10 border-b-2 border-violet-500 text-violet-400' 
                        : 'border-b-2 border-transparent text-gray-400'
                    }
                `}
            >
                Chats
                {activeTab === "Chats" && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-violet-500 to-violet-600 rounded-full" />
                )}
            </button>
        </div>
    )
}

export default ConversationListTab