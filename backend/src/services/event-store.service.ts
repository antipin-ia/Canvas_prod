import { Injectable } from '@nestjs/common';
import { CanvasEvent, CanvasState, Square } from '../types/events';

@Injectable()
export class EventStoreService {
  private events: CanvasEvent[] = [];
  private snapshots: Map<string, any> = new Map();

  async saveEvent(event: CanvasEvent): Promise<void> {
    this.events.push(event);

    if (event.version % 10 === 0) {
      await this.createSnapshot(event.aggregateId, event.version);
    }
  }

  async getEvents(aggregateId: string, fromVersion?: number): Promise<CanvasEvent[]> {
    let filteredEvents = this.events.filter(e => e.aggregateId === aggregateId);
    
    if (fromVersion !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.version > fromVersion);
    }
    
    return filteredEvents.sort((a, b) => a.version - b.version);
  }

  async getEventsUpToVersion(aggregateId: string, version: number): Promise<CanvasEvent[]> {
    return this.events
      .filter(e => e.aggregateId === aggregateId && e.version <= version)
      .sort((a, b) => a.version - b.version);
  }

  async getLatestSnapshot(aggregateId: string): Promise<any> {
    return this.snapshots.get(aggregateId) || null;
  }

  async getAllVersions(aggregateId: string): Promise<{ id: string; timestamp: Date; version: number }[]> {
    return this.events
      .filter(e => e.aggregateId === aggregateId)
      .map(event => ({
        id: event.id,
        timestamp: event.timestamp,
        version: event.version,
      }))
      .sort((a, b) => a.version - b.version);
  }

  private async createSnapshot(aggregateId: string, version: number): Promise<void> {
    const state = await this.getStateAtVersion(aggregateId, version);
    this.snapshots.set(aggregateId, { version, state });
  }

  async getStateAtVersion(aggregateId: string, version?: number): Promise<CanvasState> {
    let snapshot: any = null;
    
    if (version) {
      const snapshots = Array.from(this.snapshots.entries())
        .filter(([id, snap]) => id === aggregateId && snap.version <= version)
        .sort((a, b) => b[1].version - a[1].version);
      
      if (snapshots.length > 0) {
        snapshot = snapshots[0][1];
      }
    } else {
      snapshot = this.snapshots.get(aggregateId);
    }

    let initialState: CanvasState = {
      squares: [],
      version: snapshot?.version || 0,
      lastEventId: snapshot?.id || '',
    };

    if (snapshot) {
      initialState = snapshot.state;
    }

    const events = await this.getEventsAfterVersion(aggregateId, snapshot?.version || 0, version);
    return this.applyEvents(initialState, events);
  }

  private async getEventsAfterVersion(
    aggregateId: string, 
    fromVersion: number, 
    toVersion?: number
  ): Promise<CanvasEvent[]> {
    let events = this.events.filter(e => e.aggregateId === aggregateId && e.version > fromVersion);
    
    if (toVersion) {
      events = events.filter(e => e.version <= toVersion);
    }
    
    return events.sort((a, b) => a.version - b.version);
  }

  private applyEvents(state: CanvasState, events: CanvasEvent[]): CanvasState {
    let currentState = { ...state };

    for (const event of events) {
      currentState = this.applyEvent(currentState, event);
    }

    return currentState;
  }

  private applyEvent(state: CanvasState, event: CanvasEvent): CanvasState {
    const newState = { ...state };
    newState.version = event.version;
    newState.lastEventId = event.id;

    switch (event.type) {
      case 'SquareCreated':
        newState.squares.push({
          id: event.data.squareId,
          x: event.data.x,
          y: event.data.y,
          size: event.data.size,
          color: event.data.color,
        });
        break;

      case 'SquareMoved':
        const squareToMove = newState.squares.find(s => s.id === event.data.squareId);
        if (squareToMove) {
          squareToMove.x = event.data.x;
          squareToMove.y = event.data.y;
        }
        break;

      case 'SquareDeleted':
        newState.squares = newState.squares.filter(s => s.id !== event.data.squareId);
        break;
    }

    return newState;
  }
} 