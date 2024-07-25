import {useState,useEffect, useRef} from 'react';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
import { AudioVisualizer } from 'react-audio-visualize';

const timeFormat = (time: string) => {
    const minutes = Math.floor(parseFloat(time) / 60);
    const seconds = Math.floor(parseFloat(time) % 60);
    if (minutes > 0) {
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${seconds < 10 ? '0' : ''}${time}s`;
}

const AudioPlayer = ({src, onTimeUpdate, onLoad, visualize=false}: {src: string, onTimeUpdate?: (time: number)=>void, onLoad?: (duration: number)=>void, visualize?: boolean}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState('0.0');
    const [currentTime, setCurrentTime] = useState('0.0');
    const [audioChunk, setAudioChunk] = useState<Blob>()
    const AudioVisualizerRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
      if (!visualize||currentTime==='0.0') return
      let animationFrameId: number;
    
    function updateMask() {
      const canvas = AudioVisualizerRef.current
      if (!canvas) return;
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const progress = parseFloat(currentTime) / parseFloat(duration);
      const maskWidth = progress * canvas.width;
      console.log("progress", maskWidth)
      // Draw the mask
      ctx.save();
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = '#ffffff'; // Color for played bars
      ctx.fillRect(0, 0, maskWidth, 75);
      ctx.restore();

      if (progress === 1) return
      animationFrameId=requestAnimationFrame(updateMask)
    }
      // Request the next frame
    updateMask();

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
    }, [currentTime, duration, visualize]);
    useEffect(()=>{
      if (!visualize) return
      async function fetchChunk() {
        const response = await fetch(src)
        setAudioChunk(await response.blob())
      }
      fetchChunk()
    }, [src, visualize])
    useEffect(() => {
        if (isPlaying) {
          audioRef.current?.play();
        } else {
          audioRef.current?.pause();
        }
      }, [isPlaying]);
      useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const handleTimeUpdate = () => {
          console.log("time update", isPlaying)
          setCurrentTime(audio.currentTime.toFixed(1));
          onTimeUpdate && onTimeUpdate(audio.currentTime);
        }
        const updateDuration = () => {
          console.log(audio.duration)
          console.log(audio.src)
          if (audio.duration === Infinity || isNaN(Number(audio.duration))) {
          audio.currentTime = 1e101
          audio.addEventListener('timeupdate', getDuration)
      }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function getDuration(event: any) {
          event.target.currentTime = 0
          event.target.removeEventListener('timeupdate', getDuration)
          setDuration(event.target.duration.toFixed(1))
          onLoad && onLoad(event.target.duration);
        }
        const onEnded = () => {
          console.log("ended")
          setIsPlaying(false);
        };
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', onEnded);
    
        return () => {
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('loadedmetadata', updateDuration);
          audio.removeEventListener('ended', onEnded);
        };
      });
      const playAudio = () => {
        setIsPlaying(!isPlaying);
      };
      if (src === '') {
        return (
            <></>
        )
      }
      return (
        <div style={
          {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px'
          }
        }>
                <button style={{
                  minWidth: "30px",
                  height: "100%"
                }} type="button" onClick={playAudio}>
                  <audio src={src} ref={audioRef} />
                  {isPlaying ? '‖' : '▶'}
                </button>
                {audioChunk && <div style={
                  {
                    position: 'relative',
                    height: '50px',
                    width: '100px',
                    display: 'inline-block'
                  }
                }>
              {isPlaying && <AudioVisualizer
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, width: '100%', height: '100%'}}
              blob={audioChunk}
              barWidth={15}
              width={500}
              height={75}
              gap={2}
              barColor={'#000000'}
              ref={AudioVisualizerRef}
            />}
             {/* <AudioVisualizer
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, width: '100%', height: '100%'}}
              blob={audioChunk}
              barWidth={15}
              width={500}
              height={75}
              gap={2}
              barColor={'#000000'}
            /> */}
          </div>}
                <span style={{fontSize: '.9em'}}>{timeFormat(currentTime)+"/"+timeFormat(duration)}</span>
        </div>
      )
}

export default AudioPlayer;