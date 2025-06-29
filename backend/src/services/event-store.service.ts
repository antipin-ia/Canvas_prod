import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CanvasEvent, CanvasState, Square } from '../types/events';
import { Event } from '../entities/event.entity';
import { Snapshot } from '../entities/snapshot.entity';

@Injectable()
export class EventStoreService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
  ) {}

  async saveEvent(event: CanvasEvent): Promise<void> {
    const eventEntity = this.eventRepository.create({
      id: event.id,
      type: event.type,
      aggregateId: event.aggregateId,
      version: event.version,
      data: event.data,
      timestamp: event.timestamp,
    });

    await this.eventRepository.save(eventEntity);

    if (event.version % 10 === 0) {
      await this.createSnapshot(event.aggregateId, event.version);
    }
  }

  async getEvents(aggregateId: string, fromVersion?: number): Promise<CanvasEvent[]> {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .orderBy('event.version', 'ASC');

    if (fromVersion !== undefined) {
      queryBuilder.andWhere('event.version > :fromVersion', { fromVersion });
    }

    const events = await queryBuilder.getMany();
    return events.map(event => ({
      id: event.id,
      type: event.type as any,
      aggregateId: event.aggregateId,
      version: event.version,
      data: event.data,
      timestamp: event.timestamp,
    }));
  }

  async getEventsUpToVersion(aggregateId: string, version: number): Promise<CanvasEvent[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .andWhere('event.version <= :version', { version })
      .orderBy('event.version', 'ASC')
      .getMany();

    return events.map(event => ({
      id: event.id,
      type: event.type as any,
      aggregateId: event.aggregateId,
      version: event.version,
      data: event.data,
      timestamp: event.timestamp,
    }));
  }

  async getLatestSnapshot(aggregateId: string): Promise<any> {
    const snapshot = await this.snapshotRepository
      .createQueryBuilder('snapshot')
      .where('snapshot.aggregateId = :aggregateId', { aggregateId })
      .orderBy('snapshot.version', 'DESC')
      .getOne();

    return snapshot;
  }

  async getAllVersions(aggregateId: string): Promise<{ id: string; timestamp: Date; version: number }[]> {
    const events = await this.eventRepository
      .createQueryBuilder('event')
      .select(['event.id', 'event.timestamp', 'event.version'])
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .orderBy('event.version', 'ASC')
      .getMany();

    return events.map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      version: event.version,
    }));
  }

  private async createSnapshot(aggregateId: string, version: number): Promise<void> {
    const state = await this.getStateAtVersion(aggregateId, version);
    const snapshot = this.snapshotRepository.create({
      aggregateId,
      version,
      state,
    });
    await this.snapshotRepository.save(snapshot);
  }

  async getStateAtVersion(aggregateId: string, version?: number): Promise<CanvasState> {
    let snapshot: any = null;
    
    if (version) {
      snapshot = await this.snapshotRepository
        .createQueryBuilder('snapshot')
        .where('snapshot.aggregateId = :aggregateId', { aggregateId })
        .andWhere('snapshot.version <= :version', { version })
        .orderBy('snapshot.version', 'DESC')
        .getOne();
    } else {
      snapshot = await this.getLatestSnapshot(aggregateId);
    }

    let initialState: CanvasState = {
      squares: [],
      version: snapshot?.version || 0,
      lastEventId: '',
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
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .andWhere('event.version > :fromVersion', { fromVersion })
      .orderBy('event.version', 'ASC');

    if (toVersion) {
      queryBuilder.andWhere('event.version <= :toVersion', { toVersion });
    }

    const events = await queryBuilder.getMany();
    return events.map(event => ({
      id: event.id,
      type: event.type as any,
      aggregateId: event.aggregateId,
      version: event.version,
      data: event.data,
      timestamp: event.timestamp,
    }));
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