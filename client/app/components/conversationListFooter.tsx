import { FiPower } from "react-icons/fi";
import { logout } from "../actions/auth";

const ChatListFooter = () => {
  return (
    <form className="w-full h-16 bg-violet-600 flex flex-col  items-center justify-center gap-1" action={logout}>

      <button className="flex items-center gap-2 bg-white/20 cursor-pointer hover:bg-red-500 transition-colors duration-300 text-white px-3 py-1 rounded-full text-sm">
        <FiPower className="text-lg" />
        Logout
      </button>

      <p className="text-[10px] text-violet-200">
        Created by <span className="text-white font-medium">Parham Pazargadi</span>
      </p>

    </form>
  );
};

export default ChatListFooter;
