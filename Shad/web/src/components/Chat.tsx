import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatService from '../services/ChatService';
import type { Message } from '../services/ChatService';
import { VideoCall } from './VideoCall';
import { VoiceRecorder } from './VoiceRecorder';
import './Chat.css';

interface ChatProps {
  partnerEmail: string;
  partnerId: string;
}

export const Chat: React.FC<ChatProps> = ({ partnerEmail, partnerId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [incomingCall, setIncomingCall] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.uid) {
      ChatService.connect(userProfile.uid);

      ChatService.onReceiveMessage((message) => {
        setMessages((prev) => [...prev, message]);
      });

      ChatService.onVoiceMessage((message) => {
        setMessages((prev) => [...prev, message]);
      });

      ChatService.onTyping(() => {
        setIsPartnerTyping(true);
      });

      ChatService.onStopTyping(() => {
        setIsPartnerTyping(false);
      });

      // Call event listeners
      ChatService.onIncomingCall((from) => {
        setIncomingCall(from);
      });

      ChatService.onCallAccepted((from) => {
        setShowVideoCall(true);
        setIncomingCall(null);
      });

      ChatService.onCallRejected((from) => {
        setIncomingCall(null);
        alert('Call rejected');
      });

      ChatService.onCallEnded((from) => {
        setShowVideoCall(false);
        alert('Call ended');
      });
    }

    return () => {
      ChatService.disconnect();
    };
  }, [userProfile?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() && userProfile?.uid) {
      ChatService.sendMessage(partnerId, input, 'text');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          from: userProfile.uid,
          to: partnerId,
          text: input,
          timestamp: Date.now(),
          read: true,
          type: 'text',
        },
      ]);
      setInput('');
      ChatService.sendStopTyping(partnerId);
      setTyping(false);
    }
  };

  // Video Call Handlers
  const handleStartVideoCall = () => {
    ChatService.startCall(partnerId);
    setShowVideoCall(true);
  };

  const handleEndVideoCall = () => {
    ChatService.endCall(partnerId);
    setShowVideoCall(false);
  };

  const handleAcceptCall = () => {
    ChatService.acceptCall(incomingCall!);
  };

  const handleRejectCall = () => {
    ChatService.rejectCall(incomingCall!);
    setIncomingCall(null);
  };

  // Voice Message Handlers
  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    // Calculate duration (rough estimate)
    const duration = Math.round(audioBlob.size / 16000); // Rough calculation
    ChatService.sendVoiceMessage(partnerId, audioBlob, duration);
    setShowVoiceRecorder(false);

    // Add to local messages
    const audioUrl = URL.createObjectURL(audioBlob);
    setMessages((prev) => [
      ...prev,
      {
        id: `voice-${Date.now()}`,
        from: userProfile!.uid,
        to: partnerId,
        text: '',
        timestamp: Date.now(),
        read: true,
        type: 'voice',
        audioUrl,
        duration,
      },
    ]);
  };

  const handlePlayAudio = (messageId: string, audioUrl: string) => {
    // Stop any currently playing audio
    if (playingAudio && playingAudio !== messageId) {
      const currentAudio = audioRefs.current[playingAudio];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    const audio = audioRefs.current[messageId];
    if (audio) {
      if (playingAudio === messageId) {
        audio.pause();
        setPlayingAudio(null);
      } else {
        audio.play();
        setPlayingAudio(messageId);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!typing && e.target.value) {
      setTyping(true);
      ChatService.sendTyping(partnerId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <h2>{userProfile?.nickname || userProfile?.displayName}</h2>
          <p className="partner-email">{partnerEmail}</p>
        </div>
        <div className="chat-actions">
          <button
            className="action-btn video-call-btn"
            onClick={handleStartVideoCall}
            title="Start Video Call"
          >
            📹
          </button>
          <button
            className="action-btn voice-msg-btn"
            onClick={() => setShowVoiceRecorder(true)}
            title="Record Voice Message"
          >
            🎤
          </button>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start your conversation...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.from === userProfile?.uid ? 'sent' : 'received'}`}
            >
              {msg.type === 'voice' ? (
                <div className="voice-message">
                  <button
                    className="play-btn"
                    onClick={() => handlePlayAudio(msg.id, msg.audioUrl!)}
                  >
                    {playingAudio === msg.id ? '⏸️' : '▶️'}
                  </button>
                  <div className="voice-info">
                    <span>Voice message</span>
                    <span className="duration">
                      {msg.duration ? `${Math.floor(msg.duration / 60)}:${(msg.duration % 60).toString().padStart(2, '0')}` : ''}
                    </span>
                  </div>
                  {msg.audioUrl && (
                    <audio
                      ref={(el) => {
                        if (el) audioRefs.current[msg.id] = el;
                      }}
                      src={msg.audioUrl}
                      onEnded={() => setPlayingAudio(null)}
                      preload="none"
                    />
                  )}
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        {isPartnerTyping && <div className="typing-indicator">Your partner is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="message-input"
        />
        <button onClick={handleSendMessage} className="send-button">
          Send
        </button>
      </div>

      {/* Video Call Component */}
      {showVideoCall && (
        <VideoCall
          partnerId={partnerId}
          currentUserId={userProfile!.uid}
          onEndCall={handleEndVideoCall}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <VideoCall
          partnerId={incomingCall}
          currentUserId={userProfile!.uid}
          onEndCall={() => setIncomingCall(null)}
          isIncoming={true}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}
    </div>
  );
};

export default Chat;
