import { ChatHeaderProps } from "@/types";
import Image from "next/image";
import personPic from "../../public/person.jpeg";


export default function ChatHeader({ name, pic, status }: ChatHeaderProps) {
  return (
    <header className="flex items-center p-4 bg-white border-b">
      <Image src={pic?.url ||  personPic} alt={name} className="w-10 h-10 rounded-full" />
      <div className="ml-3">
        <h1 className="font-bold">{name}</h1>
        {/* Only show status if it exists */}
        {status && (
          <p className="text-sm text-gray-500">
            {status.activity === "typing" 
              ? `${status.username} is typing...` 
              : status.presence.replace(/_/g, ' ')}
          </p>
        )}
      </div>
    </header>
  );
}
