import React, { useRef, useEffect, useState } from 'react';
import Peer from 'simple-peer';
import ChatService from '../services/ChatService';
import VideoCallApi from '../services/VideoCallApi';
import './VideoCall.css';

interface VideoCallProps {
  partnerId: string;
  currentUserId: string;
  onEndCall: () => void;
  isIncoming?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  partnerId,
  currentUserId,
  onEndCall,
  isIncoming = false,
  onAccept,
  onReject,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Peer.Instance | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const partnerVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isIncoming) {
      startCall();
    }

    // Set up signaling listeners
    ChatService.onCallSignal((signal) => {
      if (peer && signal.from === partnerId) {
        console.log('Received signal:', signal.type);
        peer.signal(signal.data);
      }
    });

    return () => {
      cleanup();
    };
  }, [isIncoming, partnerId]);

  const startCall = async () => {
    try {
      setError(null);
      // Initiate call via API
      const initiateResponse = await VideoCallApi.initiateCall(partnerId);
      if (initiateResponse.success && initiateResponse.data) {
        setCallId(initiateResponse.data.id);
        setCallStartTime(Date.now());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setStream(mediaStream);

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream;
      }

      const peerInstance = new Peer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peerInstance.on('signal', (data) => {
        // Send signaling data through ChatService
        ChatService.sendCallSignal({
          from: currentUserId,
          to: partnerId,
          type: 'offer',
          data: data,
        });
      });

      peerInstance.on('connect', () => {
        setIsConnected(true);
        setCallStatus('connected');
        console.log('Peer connected');
      });

      peerInstance.on('stream', (partnerStream) => {
        if (partnerVideoRef.current) {
          partnerVideoRef.current.srcObject = partnerStream;
        }
      });

      peerInstance.on('close', () => {
        setCallStatus('ended');
        cleanup();
      });

      peerInstance.on('error', (err) => {
        console.error('Peer error:', err);
        setError(`Connection error: ${err.message}`);
        setCallStatus('ended');
        cleanup();
      });

      setPeer(peerInstance);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Could not access camera/microphone. Please check permissions.';
      setError(errorMessage);
      console.error('Error starting call:', error);
      alert(errorMessage);
    }
  };

  const acceptCall = async () => {
    onAccept?.();
    await startCallAsReceiver();
  };

  const startCallAsReceiver = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setStream(mediaStream);
      setCallStartTime(Date.now());

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream;
      }

      const peerInstance = new Peer({
        initiator: false, // We're receiving the call
        trickle: false,
        stream: mediaStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peerInstance.on('signal', (data) => {
        // Send answer back
        ChatService.sendCallSignal({
          from: currentUserId,
          to: partnerId,
          type: 'answer',
          data: data,
        });
      });

      peerInstance.on('connect', () => {
        setIsConnected(true);
        setCallStatus('connected');
        console.log('Peer connected (receiver)');
      });

      peerInstance.on('stream', (partnerStream) => {
        if (partnerVideoRef.current) {
          partnerVideoRef.current.srcObject = partnerStream;
        }
      });

      peerInstance.on('close', () => {
        setCallStatus('ended');
        cleanup();
      });

      peerInstance.on('error', (err) => {
        console.error('Peer error:', err);
        setError(`Connection error: ${err.message}`);
        setCallStatus('ended');
        cleanup();
      });

      setPeer(peerInstance);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Could not access camera/microphone. Please check permissions.';
      setError(errorMessage);
      console.error('Error accepting call:', error);
      alert(errorMessage);
    }
  };

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    ChatService.endCall(partnerId);
    
    // End call via API if we have a call ID
    if (callId) {
      VideoCallApi.endCall(callId).catch(err => 
        console.error('Failed to log call end:', err)
      );
    }
    
    cleanup();
    onEndCall();
  };

  const cleanup = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    setStream(null);
    setPeer(null);
    setIsConnected(false);
  };

  if (isIncoming) {
    return (
      <div className="incoming-call-modal">
        <div className="incoming-call-content">
          <h3>📞 Incoming Call</h3>
          <p>From: {partnerId}</p>
          <div className="call-actions">
            <button className="accept-call-btn" onClick={acceptCall}>
              📞 Accept
            </button>
            <button className="reject-call-btn" onClick={onReject}>
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      {error && (
        <div className="call-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      
      <div className="video-call-header">
        <span className="call-status">
          {callStatus === 'connecting' && '🔄 Connecting...'}
          {callStatus === 'connected' && '🟢 Connected'}
          {callStatus === 'ended' && '❌ Call Ended'}
        </span>
        <button className="end-call-btn" onClick={endCall}>
          ❌ End Call
        </button>
      </div>

      <div className="video-area">
        <video
          ref={partnerVideoRef}
          autoPlay
          playsInline
          className="partner-video"
        />
        <video
          ref={myVideoRef}
          autoPlay
          playsInline
          muted
          className="my-video"
        />
      </div>

      <div className="call-controls">
        <button
          className={`control-btn ${isMuted ? 'muted' : ''}`}
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>
        <button
          className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
          onClick={toggleVideo}
          title={isVideoOff ? 'Turn on video' : 'Turn off video'}
        >
          {isVideoOff ? '📷' : '📹'}
        </button>
      </div>
    </div>
  );
};