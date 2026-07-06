import React, { useState, useEffect } from 'react';
import './SpeechInput.css';

const MicIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
  </svg>
);

const SpeechInput = ({ onTranscript, language = 'en-US' }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = language;

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) {
        onTranscript(transcript);
      }
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
  }, [language, onTranscript]);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  if (!supported) {
    return (
      <button className="speech-btn" disabled title="Speech recognition not supported in this browser">
        <MicIcon /> Not supported
      </button>
    );
  }

  return (
    <button
      className={`speech-btn ${isListening ? 'listening' : ''}`}
      onClick={startListening}
      disabled={isListening}
    >
      <MicIcon /> {isListening ? 'Listening…' : 'Speak symptoms'}
    </button>
  );
};

export default SpeechInput;
