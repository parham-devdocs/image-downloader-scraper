import { useEffect, useState } from "react";
import { socket } from "../socket";
import { ConversationMetaData,  UserStatus } from "@/types";
import { ParamValue } from "next/dist/server/request/params";

type UseSocketProps = {
  conversationMetaData?:ConversationMetaData | null;
  id: ParamValue;
};

const useSocket = ({ conversationMetaData, id }: UseSocketProps) => {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
const [onlineUsers,setOnlineUsers]=useState(0)
  const [userStatus, setUserStatus] = useState<UserStatus>({
    presence: "offline",
    isTyping: false,
  });

  const otherMemberId =
    conversationMetaData?.metadata?.otherMember?._id;

  useEffect(() => {
    if (!id) return;
    const onConnect = () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join_room", id);
    };

    const onUserInRoom = (users: string[]) => {
      setOnlineUsers(users.length);
      if (users.length>1) {
        console.log("more than one user")
        setUserStatus((prev) => ({
            ...prev,
            presence:"online"
          }));      }
    };

    const onTypingIndicator = (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);

        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }

        return newSet;
      });
console.log({otherMemberId})
      if (otherMemberId) {
        setUserStatus((prev) => ({
          ...prev,
          isTyping: data.isTyping,
        }));
      }
    };

    socket.on("connect", onConnect);
    socket.on("user in room", onUserInRoom);
    socket.on("typing_indicator", onTypingIndicator);

    if (socket.connected) {
      socket.emit("join_room", id);
    }
// console.log(typingUsers)
    return () => {
      socket.off("connect", onConnect);
      socket.off("user in room", onUserInRoom);
      socket.off("typing_indicator", onTypingIndicator);

      socket.emit("leave_room", id);
    };
  }, [id, otherMemberId]);

  return {
    typingUsers,
    onlineUsers,
    userStatus,
  };
};

export default useSocket;
