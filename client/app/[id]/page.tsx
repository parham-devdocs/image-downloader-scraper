import React from "react";
import ChatList from "../components/conversationList";
import ChatPage from "../components/chatPage";
const Page = () => {
  return (
    <div className=" flex">
      <div>
        <ChatList />
      </div>
      <div className=" flex-1">
        <ChatPage></ChatPage>
      </div>
    </div>
  );
};

export default Page;
