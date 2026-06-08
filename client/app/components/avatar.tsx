
import { Attachment } from '@/types'
import Image from 'next/image'
import Link from 'next/link';
import unknownPerson  from "../../public/person.jpeg";


// Simple Avatar component that handles both cases
const Avatar = ({ url, link }: Omit<Attachment  ,"filename"| "originalName"| "mimeType"| "size"> & { link?: string }) => {
  // Ensure we have a valid url, fallback to unknownPerson
  const finalUrl = url || unknownPerson;

  const imageElement = (
    <div className="relative w-14 hover:scale-110 transition-all duration-500 h-14 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 ring-2 ring-transparent group-hover:ring-white/40">
      <Image 
        src={finalUrl} 
        alt={ "person"} 
        fill 
        className="object-cover" 
      />
    </div>
  );

  return link ? <Link href={link}>{imageElement}</Link> : imageElement;
};
export default Avatar