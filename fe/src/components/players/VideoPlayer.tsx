import React, { useState, useEffect, useRef } from 'react';
import styles from '@/styles/Video.module.scss';
const VideoPlayer = ({ src }: {src: string}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.requestFullscreen) {
      video.requestFullscreen();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }  else if ((video as any).webkitEnterFullscreen) { // TypeScript type assertion for webkitEnterFullscreen
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (video as any).webkitEnterFullscreen(); // This is specific to iOS Safari
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (parseFloat(event.target.value) / 100) * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };
  const handleVideoEnd = () => {
    setIsPlaying(false);
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.pause();
    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);
  useEffect(() => {
    if(isPlaying){
      videoRef.current?.play()
    }else{
      videoRef.current?.pause()
    }
  },[isPlaying])

  return (
    <div className={styles.container}>
        <video ref={videoRef} className={isPlaying?"":styles.paused} preload="metadata" playsInline autoPlay onClick={togglePlay}>
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      <button onClick={togglePlay} className={`${styles.play} ${isPlaying?"":styles.paused}`}>{isPlaying ? '‖' : '▶'}</button>
      <div className={styles.meta}>
        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        <input className={styles.progress} type="range" min="0" max="100" value={duration > 0 ?(currentTime / duration) * 100 : 0} onChange={handleProgressChange} />
        <button onClick={toggleFullScreen}>⛶</button>
      </div>
    </div>
  );
};

export default VideoPlayer;