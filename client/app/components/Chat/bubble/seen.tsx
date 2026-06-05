import { BiCheck } from "react-icons/bi";
import { LuCheckCheck } from "react-icons/lu";


const SeenComponent = ({ seen,isOwn }: { seen: boolean,isOwn:boolean }) => {
    return seen && !isOwn ? (
      <div className="flex items-center gap-0.5" title="Seen">
        <LuCheckCheck  className="w-5 h-5 text-green-500" />
      </div>
    ) : (
      <div className="flex items-center gap-0.5" title="Delivered">
        <BiCheck  className="w-5 h-5 text-gray-200" />
      </div>
    );
  };


  export default SeenComponent