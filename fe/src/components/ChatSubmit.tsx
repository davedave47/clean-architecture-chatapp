import { FormEvent, useState } from 'react';
import styles from '../styles/ChatSection.module.scss';
export default function ChatSubmit({ onSend }: { onSend: (message: string, files?: FileList) => void}){
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
  <input id="file-upload" type="file" style={{display: 'none'}} onChange={(e) => setFiles(e.target.files)} multiple />      
  <input
    type="text"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
  />
  <button type="submit">Send</button>
</form>
    </>
  );
}