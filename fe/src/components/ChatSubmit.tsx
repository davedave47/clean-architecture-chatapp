import { FormEvent, useState, useEffect, useRef } from 'react';
import styles from '../styles/ChatSection.module.scss';
import AudioPlayer from './AudioPlayer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { AudioVisualizer } from 'react-audio-visualize';

export default function ChatSubmit({ onSend }: { onSend: (message: string, files?: FileList) => void }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isAudio, setIsAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recordingStopped = useRef(true);
  const AudioVisualizerRef = useRef<HTMLCanvasElement>(null);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const durationRef = useRef(0);
  const isPlaying = useRef(false)
  useEffect(() => {
    if (currentAudioTime === 0) return
    isPlaying.current = currentAudioTime < durationRef.current
    let animationFrameId: number;
    
    function updateMask() {
      const canvas = AudioVisualizerRef.current
      if (!canvas) return;
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const progress = currentAudioTime / durationRef.current;
      const maskWidth = progress * canvas.width;
      console.log("progress")

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
  }, [currentAudioTime]);
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  useEffect(() => {
    return () => {
      console.log('cleanup');
      setIsRecording(!isAudio);
      setAudioChunks([]);
      setAudioUrl('');
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      recordingStopped.current = true;
    };
  },[isAudio])

  useEffect(() => {
    recordingStopped.current = !isRecording;
    if (isRecording) {
      setAudioChunks([]);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
              console.log("data available");
              if (recordingStopped.current) return
              setAudioChunks((prev) => [...prev, event.data]);
            };
            mediaRecorderRef.current.start(100);
          })
          .catch((error) => {
            console.error("Error accessing media devices.", error);
          });
      } else {
        console.error("getUserMedia not supported");
      }
    } else {
      mediaRecorderRef.current?.stop();
    }
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
      const newAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(newAudioUrl);
      console.log("audio url", newAudioUrl);
      console.log("audio chunks", audioBlob.size);
    }
  }, [isRecording, audioChunks]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (audioChunks.length > 0) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(audioChunks, `${Date.now()}.mp3`));
      onSend(message, dataTransfer.files);
      setAudioChunks([]);
      setAudioUrl('');
      setIsRecording(false);
      return;
    }
    if (files) {
      onSend(message, files);
      setMessage('');
      setFiles(null);
      return;
    }
    if (message.length === 0) return;
    onSend(message);
    setMessage('');
  };

  return (
    <>
      <div className={styles.files}>
        {files && [...files].map((file, index) => (
          <span key={index}>{file.name}</span>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="file-upload" className="custom-file-upload">
          &#x1F4E5;
        </label>
        <input id="file-upload" type="file" style={{ display: 'none' }} onChange={(e) => setFiles(e.target.files)} multiple />
        <label className={styles.recorder} onClick={() => {
          setIsAudio(!isAudio);
        }}>&#x1F3A4;</label>
        {isAudio ?
          <div className={styles.audio}>
            {!isRecording &&
              <AudioPlayer src={audioUrl} key={audioUrl} onTimeUpdate={(number)=>{setCurrentAudioTime(number)}} onLoad={(duration)=>{durationRef.current=duration}}/>
            }
            {audioChunks.length > 0 &&
            <span className = {styles.canvas}>
            {isPlaying.current && <AudioVisualizer
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 2}}
              blob={new Blob(audioChunks, { type: 'audio/mp3' })}
              width={500}
              height={75}
              barWidth={2}
              gap={2}
              barColor={'#000000'}
              ref={AudioVisualizerRef}
            />}
            <AudioVisualizer
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 1}}
              blob={new Blob(audioChunks, { type: 'audio/mp3' })}
              width={500}
              height={75}
              barWidth={2}
              gap={2}
              barColor={'#000000'}
            />
          </span>}
            <button type="button" onClick={() => {setIsRecording(!isRecording); isPlaying.current=false}}>
              {isRecording ? <i>&#x23F9;</i> : <i>&#9657;</i>}
            </button>
          </div> :
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        }
        <button type="submit">Send</button>
      </form>
    </>
  );
}
