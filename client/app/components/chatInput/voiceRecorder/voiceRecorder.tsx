import { useEffect, useState } from "react";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import MicNoiseIndicator from "./indicator";

const VoiceRecorder = () => {
  const [time, setTime] = useState(0);

  // Use a standard requestAnimationFrame or a high-freq timer
  // to update the display, but calculate time based on Date.now()
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTime(Date.now() - startTime);
    }, 50); // Updates display 20 times per second for smooth UI

    return () => clearInterval(interval);
  }, []);

  const format = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className=" flex items-center gap-32 w-1/2 ">
      <button className=" flex items-center gap-1 starting:opacity-0 opacity-100 transition-all duration-1000 ">
        <MdKeyboardDoubleArrowLeft size={25} /> cancel
      </button>
      <MicNoiseIndicator />
      <div className=" flex items-center gap-2 flex-1 starting:opacity-0 opacity-100 transition-all duration-500">
        <div className=" w-3 h-3 rounded-full bg-red-500  animate-pulse"></div>

        <p>{format(time)}</p>
      </div>
    </div>
  );
};

export default VoiceRecorder;
