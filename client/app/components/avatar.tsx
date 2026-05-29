
import { Attachment } from '@/types'
import Image from 'next/image'
import unknownPerson from "../../public/person.jpeg";


const Avatar = ({url,filename}:Attachment) => {
  return (
    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 ring-2 ring-transparent group-hover:ring-white/40 transition">
     
      <Image src={url ? url : unknownPerson} alt={filename || "person"} fill className="object-cover" />

  </div>  )
}

export default Avatar