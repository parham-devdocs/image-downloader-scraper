

import React, { ReactNode } from 'react'
import ConversationList from '../components/conversationList'

const layout = ({children}:{children:ReactNode}) => {
  return (
    <div className=" flex">
    <div>
      <ConversationList />
    </div>
    <div className=" flex-1">
      {children}
    </div>
  </div>  )
}

export default layout