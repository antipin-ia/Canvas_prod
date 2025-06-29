import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventStoreService } from '../services/event-store.service';
import { CanvasEvent, CanvasState } from '../types/events';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"]
  }
})
export class CanvasGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventStoreService: EventStoreService) {}

  @SubscribeMessage('getState')
  async handleGetState(
    @MessageBody() data: { aggregateId: string; version?: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const state = await this.eventStoreService.getStateAtVersion(
        data.aggregateId,
        data.version,
      );
      client.emit('stateReceived', state);
    } catch (error) {
      client.emit('error', { message: 'Failed to get state', error: error.message });
    }
  }

  @SubscribeMessage('getVersions')
  async handleGetVersions(
    @MessageBody() data: { aggregateId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const versions = await this.eventStoreService.getAllVersions(data.aggregateId);
      client.emit('versionsReceived', versions);
    } catch (error) {
      client.emit('error', { message: 'Failed to get versions', error: error.message });
    }
  }

  @SubscribeMessage('createSquare')
  async handleCreateSquare(
    @MessageBody() data: { 
      aggregateId: string; 
      x: number; 
      y: number; 
      size: number; 
      color: string;
      currentVersion: number;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const event: CanvasEvent = {
        id: uuidv4(),
        type: 'SquareCreated',
        timestamp: new Date(),
        aggregateId: data.aggregateId,
        version: data.currentVersion + 1,
        data: {
          squareId: uuidv4(),
          x: data.x,
          y: data.y,
          size: data.size,
          color: data.color,
        },
      };

      await this.eventStoreService.saveEvent(event);
      
      // Broadcast the new state to all clients
      const newState = await this.eventStoreService.getStateAtVersion(data.aggregateId);
      this.server.emit('stateUpdated', newState);
      
      // Send confirmation to the client
      client.emit('eventConfirmed', { eventId: event.id, newState });
    } catch (error) {
      client.emit('error', { message: 'Failed to create square', error: error.message });
    }
  }

  @SubscribeMessage('moveSquare')
  async handleMoveSquare(
    @MessageBody() data: { 
      aggregateId: string; 
      squareId: string; 
      x: number; 
      y: number;
      currentVersion: number;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const event: CanvasEvent = {
        id: uuidv4(),
        type: 'SquareMoved',
        timestamp: new Date(),
        aggregateId: data.aggregateId,
        version: data.currentVersion + 1,
        data: {
          squareId: data.squareId,
          x: data.x,
          y: data.y,
        },
      };

      await this.eventStoreService.saveEvent(event);
      
      // Broadcast the new state to all clients
      const newState = await this.eventStoreService.getStateAtVersion(data.aggregateId);
      this.server.emit('stateUpdated', newState);
      
      // Send confirmation to the client
      client.emit('eventConfirmed', { eventId: event.id, newState });
    } catch (error) {
      client.emit('error', { message: 'Failed to move square', error: error.message });
    }
  }

  @SubscribeMessage('deleteSquare')
  async handleDeleteSquare(
    @MessageBody() data: { 
      aggregateId: string; 
      squareId: string;
      currentVersion: number;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const event: CanvasEvent = {
        id: uuidv4(),
        type: 'SquareDeleted',
        timestamp: new Date(),
        aggregateId: data.aggregateId,
        version: data.currentVersion + 1,
        data: {
          squareId: data.squareId,
        },
      };

      await this.eventStoreService.saveEvent(event);
      
      // Broadcast the new state to all clients
      const newState = await this.eventStoreService.getStateAtVersion(data.aggregateId);
      this.server.emit('stateUpdated', newState);
      
      // Send confirmation to the client
      client.emit('eventConfirmed', { eventId: event.id, newState });
    } catch (error) {
      client.emit('error', { message: 'Failed to delete square', error: error.message });
    }
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
} 