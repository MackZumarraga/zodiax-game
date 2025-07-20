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

    // Character selection events
    this.socket.on('availableCharacters', (data: any) => {
      this.gameCallbacks.onAvailableCharacters?.(data);
    });

    this.socket.on('characterTaken', (data: any) => {
      this.gameCallbacks.onCharacterTaken?.(data);
    });

    this.socket.on('characterSelected', (data: any) => {
      this.gameCallbacks.onCharacterSelected?.(data);
    });

    this.socket.on('characterFreed', (data: any) => {
      this.gameCallbacks.onCharacterFreed?.(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  selectCharacter(character: string) {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }
    this.socket.emit('selectCharacter', { character });
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
    onAvailableCharacters?: (data: any) => void;
    onCharacterTaken?: (data: any) => void;
    onCharacterSelected?: (data: any) => void;
    onCharacterFreed?: (data: any) => void;
  }) {
    this.gameCallbacks = callbacks;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketManager = new SocketManager();