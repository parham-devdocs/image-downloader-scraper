
"use client"

import { ChatBubbleType } from '@/types'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getMessagesInConversation } from '../actions/messages'

const ChatPage = () => {
  const [messages,setMessages]=useState<ChatBubbleType| null>()
  const {id}=useParams()
  async function loadData() {
    const response=await getMessagesInConversation(String(id))
console.log(response)
  }
  useEffect(()=>{
    loadData()
  },[])
  return (
    <div>
      
    </div>
  )
}

export default ChatPage