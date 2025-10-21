"use client";

import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Simplified WebSocket simulation for demo
  useEffect(() => {
    setIsConnected(true);
    setConnectionStatus('connected');
    onConnect?.();
    
    return () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  };

  const connect = () => {
    setIsConnected(true);
    setConnectionStatus('connected');
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnectAttempts: 0
  };
}