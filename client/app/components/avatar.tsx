
import { type Avtar } from '@/types'
import Image from 'next/image'


const Avatar = ({name,avatarURL}:Avtar) => {
  return (
    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 ring-2 ring-transparent group-hover:ring-white/40 transition">
    {avatarURL ? (
      <Image src={avatarURL} alt={name} fill className="object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-slate-500 group-hover:text-white font-bold text-lg">
        {name.charAt(0).toUpperCase()}
      </div>
    )}
  </div>  )
}

export default Avatar