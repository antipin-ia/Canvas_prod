import { io, Socket } from 'socket.io-client';
import { CanvasState, VersionInfo } from '../types/canvas';

export class SocketService {
  private socket: Socket | null = null;
  private aggregateId: string = 'canvas-1';

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io('http://localhost:3000');

      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getState(version?: number): Promise<CanvasState> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getState', { aggregateId: this.aggregateId, version });
      
      this.socket.once('stateReceived', (state: CanvasState) => {
        resolve(state);
      });

      this.socket.once('error', (error) => {
        reject(error);
      });
    });
  }

  getVersions(): Promise<VersionInfo[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getVersions', { aggregateId: this.aggregateId });
      
      this.socket.once('versionsReceived', (versions: VersionInfo[]) => {
        resolve(versions);
      });

      this.socket.once('error', (error) => {
        reject(error);
      });
    });
  }

  createSquare(x: number, y: number, size: number, color: string, currentVersion: number): Promise<{ eventId: string; newState: CanvasState }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('createSquare', {
        aggregateId: this.aggregateId,
        x,
        y,
        size,
        color,
        currentVersion,
      });
      
      this.socket.once('eventConfirmed', (data: { eventId: string; newState: CanvasState }) => {
        resolve(data);
      });

      this.socket.once('error', (error) => {
        reject(error);
      });
    });
  }

  moveSquare(squareId: string, x: number, y: number, currentVersion: number): Promise<{ eventId: string; newState: CanvasState }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('moveSquare', {
        aggregateId: this.aggregateId,
        squareId,
        x,
        y,
        currentVersion,
      });
      
      this.socket.once('eventConfirmed', (data: { eventId: string; newState: CanvasState }) => {
        resolve(data);
      });

      this.socket.once('error', (error) => {
        reject(error);
      });
    });
  }

  deleteSquare(squareId: string, currentVersion: number): Promise<{ eventId: string; newState: CanvasState }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('deleteSquare', {
        aggregateId: this.aggregateId,
        squareId,
        currentVersion,
      });
      
      this.socket.once('eventConfirmed', (data: { eventId: string; newState: CanvasState }) => {
        resolve(data);
      });

      this.socket.once('error', (error) => {
        reject(error);
      });
    });
  }

  onStateUpdate(callback: (state: CanvasState) => void): void {
    if (this.socket) {
      this.socket.on('stateUpdated', callback);
    }
  }

  offStateUpdate(callback: (state: CanvasState) => void): void {
    if (this.socket) {
      this.socket.off('stateUpdated', callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  offError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.off('error', callback);
    }
  }
} 