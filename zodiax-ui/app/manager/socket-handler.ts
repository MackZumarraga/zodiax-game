import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private gameCallbacks: any = {};

  connect(serverUrl: string = 'http://192.168.0.104:4000') {
    if (this.socket?.connected) return;

    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      console.log('Connected to game server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
    });

    this.socket.on('waitingForMatch', () => {
      this.gameCallbacks.onWaitingForMatch?.();
    });

    this.socket.on('gameFound', (gameData: any) => {
      this.gameCallbacks.onGameFound?.(gameData);
    });

    this.socket.on('gameUpdate', (updateData: any) => {
      this.gameCallbacks.onGameUpdate?.(updateData);
    });

    this.socket.on('opponentDisconnected', () => {
      this.gameCallbacks.onOpponentDisconnected?.();
    });

    this.socket.on('error', (error: any) => {
      this.gameCallbacks.onError?.(error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  findMatch(playerName: string) {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('findMatch', { name: playerName });
  }

  sendPlayerAction(roomId: string, action: string) {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('playerAction', { roomId, action });
  }

  setGameCallbacks(callbacks: {
    onWaitingForMatch?: () => void;
    onGameFound?: (gameData: any) => void;
    onGameUpdate?: (updateData: any) => void;
    onOpponentDisconnected?: () => void;
    onError?: (error: any) => void;
  }) {
    this.gameCallbacks = callbacks;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketManager = new SocketManager();