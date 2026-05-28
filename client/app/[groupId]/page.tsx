import React from 'react'
import ChatList from '../components/chatList'
import ChatPage from '../components/chatPage'
const Page = () => {

  
  return (
    <div className=' flex'>
     <div  ><ChatList/></div> 
      <div className=' flex-1' ><ChatPage></ChatPage></div>
    </div>
  )
}

export default Page