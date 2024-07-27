import {useState,useEffect, useRef} from 'react';
import WaveSurfer from 'wavesurfer.js'
import styles from '../styles/AudioPlayer.module.scss';

function timeFormat(time: number): string {
    const minutes = Math.floor(time / 60);
    if (minutes > 0) {
        return timeFormat(minutes) + `:${time < 10 ? '0' : ''}${Math.floor(time%60)}s`;
    }
    return `${time < 10 && time > 0 ? '0' : ''}${time.toFixed(1)}s`;
}

const AudioPlayer = ({src, visualize=false, waveColor, progressColor, isRecording=false, backgroundColor='transparent', textColor='black'}: {src: string|Blob, visualize?: boolean, waveColor: string, progressColor: string, isRecording?: boolean, backgroundColor?: string, textColor?:string}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer|null>(null);
    useEffect(() => {

      if (!waveformRef.current||!visualize) return;
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: waveColor,
        progressColor: progressColor,
        barWidth: 2,
        barGap: 3,
        height: "auto",
        cursorColor: 'transparent',
        normalize: true,
        cursorWidth: 0,
      });
      if (src instanceof Blob) {
        wavesurfer.current.loadBlob(src);
      } else {
        wavesurfer.current.load(src);
        wavesurfer.current.on('ready', () => {
          setDuration(wavesurfer.current!.getDuration());
        })
        wavesurfer.current.on('audioprocess', () => {
          setCurrentTime(wavesurfer.current!.getCurrentTime());
        })
        wavesurfer.current.on('finish', () => {
          console.log('finished');
          setIsPlaying(false);    
        })
      }
      return () => {
        if (!wavesurfer.current) return
        wavesurfer.current.empty();
        wavesurfer.current.destroy();
      }
    },[waveformRef, waveColor, src, progressColor, visualize]);
    useEffect(() => {
      if (!wavesurfer.current) return;
      if (isPlaying) {
        wavesurfer.current.play();
      } else {
        wavesurfer.current.pause();
      }
    },[isPlaying]);
      if (src === '') {
        return (
            <></>
        )
      }
      return (
        <div className={styles.container} >
                {!isRecording && <button className={styles.play} type="button" onClick={()=>setIsPlaying(prev => !prev)}>
                  {isPlaying ? '‖' : '▶'}
                </button>}
                {!isRecording && duration > 0 && <span className={styles.time} style={{fontSize: '.9em', backgroundColor: backgroundColor, color: textColor}}>{timeFormat(currentTime)+"/"+timeFormat(duration)}</span>}
                {visualize && <span className={styles["visualizer-container"]} style={{backgroundColor: backgroundColor}}><div ref={waveformRef} className={styles.visualizer}></div></span>}
        </div>
      )
}

export default AudioPlayer;