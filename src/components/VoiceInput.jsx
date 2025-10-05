import { useState, useEffect } from 'react';

const VoiceInput = ({ value, onChange, placeholder, language }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language || 'hi-IN';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language, onChange]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 50px 12px 12px',
          fontSize: '16px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          outline: 'none',
          transition: 'border-color 0.3s',
        }}
        onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
        onBlur={(e) => e.target.style.borderColor = '#ddd'}
      />
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: isListening ? '#f44336' : '#4CAF50',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          animation: isListening ? 'pulse 1.5s infinite' : 'none',
        }}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>
    </div>
  );
};

export default VoiceInput;
