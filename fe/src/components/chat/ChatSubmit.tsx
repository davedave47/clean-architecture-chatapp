import { FormEvent, useState, useEffect, useRef } from 'react';
import styles from '@/styles/ChatSection.module.scss';
import AudioPlayer from '../players/AudioPlayer';
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export default function ChatSubmit({ onSend }: { onSend: (message: string, files?: FileList) => void }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isAudio, setIsAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    }
  },[audioUrl])
  useEffect(() => {
    return () => {
      setIsRecording(!isAudio);
      setAudioChunks([]);
      setAudioUrl(null);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  },[isAudio])

  useEffect(() => {
    if (isRecording) {
      setAudioUrl(null);
      setAudioChunks([]);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
              setIsRecording(prevIsRecording => {
                if (prevIsRecording) {
                  setAudioChunks((prev) => [...prev, event.data]);
                }
                return prevIsRecording;
              });
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
      setAudioUrl(URL.createObjectURL(new Blob(audioChunks, { type: 'audio/mp3' })));
      mediaRecorderRef.current?.stop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (audioChunks.length > 0) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File(audioChunks, `${Date.now()}.mp3`));
      onSend(message, dataTransfer.files);
      setAudioChunks([]);
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
            <div className={styles.visualizer}>
            {audioChunks.length > 0 && <AudioPlayer
                src={audioUrl ? audioUrl : new Blob(audioChunks, { type: 'audio/mp3' })}
                waveColor="#000000"
                progressColor="#ffffff"
                visualize={true}
                isRecording={isRecording}
                backgroundColor='#045eda'
                textColor='white'
              />}
            </div>
            <button type="button" onClick={() => setIsRecording(!isRecording)}>
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
