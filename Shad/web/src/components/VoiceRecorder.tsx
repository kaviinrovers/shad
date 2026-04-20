import React, { useState, useRef, useEffect } from 'react';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analysis for visual feedback
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start recording
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        cleanup();
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start audio level monitoring
      monitorAudioLevel();

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255); // Normalize to 0-1

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    cleanup();
    onCancel?.();
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setRecordingTime(0);
    setAudioLevel(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      <div className="recorder-header">
        <h4>🎤 Voice Message</h4>
        <button className="cancel-btn" onClick={cancelRecording}>
          ✕
        </button>
      </div>

      <div className="recorder-content">
        <div className="recording-indicator">
          <div
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? '⏹️' : '🎤'}
          </div>

          {isRecording && (
            <div className="audio-visualizer">
              <div
                className="audio-bar"
                style={{
                  height: `${audioLevel * 100}%`,
                  backgroundColor: audioLevel > 0.7 ? '#ff4757' : '#3742fa'
                }}
              />
              <div
                className="audio-bar"
                style={{
                  height: `${audioLevel * 80}%`,
                  backgroundColor: audioLevel > 0.7 ? '#ff4757' : '#3742fa'
                }}
              />
              <div
                className="audio-bar"
                style={{
                  height: `${audioLevel * 60}%`,
                  backgroundColor: audioLevel > 0.7 ? '#ff4757' : '#3742fa'
                }}
              />
              <div
                className="audio-bar"
                style={{
                  height: `${audioLevel * 40}%`,
                  backgroundColor: audioLevel > 0.7 ? '#ff4757' : '#3742fa'
                }}
              />
              <div
                className="audio-bar"
                style={{
                  height: `${audioLevel * 20}%`,
                  backgroundColor: audioLevel > 0.7 ? '#ff4757' : '#3742fa'
                }}
              />
            </div>
          )}
        </div>

        <div className="recording-info">
          {isRecording ? (
            <div className="recording-status">
              <span className="recording-dot">🔴</span>
              <span>Recording... {formatTime(recordingTime)}</span>
            </div>
          ) : (
            <div className="recording-instructions">
              <p>Tap to start recording</p>
              <p className="hint">Maximum 60 seconds</p>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="recording-actions">
            <button className="stop-btn" onClick={stopRecording}>
              ⏹️ Stop & Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};