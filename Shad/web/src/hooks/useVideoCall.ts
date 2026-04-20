import { useCallback, useRef, useEffect } from 'react';

export interface UseVideoCallState {
  stream: MediaStream | null;
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  error: string | null;
}

interface UseVideoCallReturn extends UseVideoCallState {
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  setupVideoRef: (element: HTMLVideoElement | null) => void;
  setupAudioRef: (element: HTMLVideoElement | null) => void;
}

export const useVideoCall = (): UseVideoCallReturn => {
  const streamRef = useRef<MediaStream | null>(null);
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const isConnectedRef = useRef(false);
  const isMutedRef = useRef(false);
  const isVideoOffRef = useRef(false);
  const errorRef = useRef<string | null>(null);

  const startCall = useCallback(async () => {
    try {
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

      streamRef.current = mediaStream;

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream;
      }

      return mediaStream;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Could not access camera/microphone';
      errorRef.current = errorMessage;
      throw new Error(errorMessage);
    }
  }, []);

  const endCall = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null;
    }

    isConnectedRef.current = false;
    isMutedRef.current = false;
    isVideoOffRef.current = false;
  }, []);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      const newMutedState = !isMutedRef.current;
      audioTracks.forEach((track) => {
        track.enabled = !newMutedState;
      });
      isMutedRef.current = newMutedState;
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      const newVideoOffState = !isVideoOffRef.current;
      videoTracks.forEach((track) => {
        track.enabled = !newVideoOffState;
      });
      isVideoOffRef.current = newVideoOffState;
    }
  }, []);

  const setupVideoRef = useCallback((element: HTMLVideoElement | null) => {
    myVideoRef.current = element;
  }, []);

  const setupAudioRef = useCallback((element: HTMLVideoElement | null) => {
    myVideoRef.current = element;
  }, []);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    stream: streamRef.current,
    isConnected: isConnectedRef.current,
    isMuted: isMutedRef.current,
    isVideoOff: isVideoOffRef.current,
    error: errorRef.current,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    setupVideoRef,
    setupAudioRef,
  };
};
