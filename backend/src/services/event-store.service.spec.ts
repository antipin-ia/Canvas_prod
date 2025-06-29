import { Test, TestingModule } from '@nestjs/testing';
import { EventStoreService } from './event-store.service';
import { CanvasEvent, CanvasState } from '../types/events';

describe('EventStoreService', () => {
  let service: EventStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventStoreService],
    }).compile();

    service = module.get<EventStoreService>(EventStoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveEvent', () => {
    it('should save an event', async () => {
      const event: CanvasEvent = {
        id: 'test-id',
        type: 'SquareCreated',
        timestamp: new Date(),
        aggregateId: 'canvas-1',
        version: 1,
        data: {
          squareId: 'square-1',
          x: 100,
          y: 100,
          size: 50,
          color: 'red',
        },
      };

      await service.saveEvent(event);
      const state = await service.getStateAtVersion('canvas-1');
      
      expect(state.squares).toHaveLength(1);
      expect(state.squares[0].id).toBe('square-1');
    });

    it('should create snapshot every 10 events', async () => {
      const event: CanvasEvent = {
        id: 'test-id',
        type: 'SquareCreated',
        timestamp: new Date(),
        aggregateId: 'canvas-1',
        version: 10,
        data: {
          squareId: 'square-1',
          x: 100,
          y: 100,
          size: 50,
          color: 'red',
        },
      };

      await service.saveEvent(event);
      const snapshot = await service.getLatestSnapshot('canvas-1');
      
      expect(snapshot).toBeTruthy();
      expect(snapshot.version).toBe(10);
    });
  });

  describe('getStateAtVersion', () => {
    it('should return initial state when no events exist', async () => {
      const result = await service.getStateAtVersion('canvas-1');

      expect(result).toEqual({
        squares: [],
        version: 0,
        lastEventId: '',
      });
    });

    it('should apply events correctly', async () => {
      const events = [
        {
          id: 'event-1',
          type: 'SquareCreated' as const,
          timestamp: new Date(),
          aggregateId: 'canvas-1',
          version: 1,
          data: {
            squareId: 'square-1',
            x: 100,
            y: 100,
            size: 50,
            color: 'red',
          },
        },
        {
          id: 'event-2',
          type: 'SquareMoved' as const,
          timestamp: new Date(),
          aggregateId: 'canvas-1',
          version: 2,
          data: {
            squareId: 'square-1',
            x: 200,
            y: 200,
          },
        },
      ];

      for (const event of events) {
        await service.saveEvent(event);
      }

      const result = await service.getStateAtVersion('canvas-1');

      expect(result.squares).toHaveLength(1);
      expect(result.squares[0]).toEqual({
        id: 'square-1',
        x: 200,
        y: 200,
        size: 50,
        color: 'red',
      });
      expect(result.version).toBe(2);
      expect(result.lastEventId).toBe('event-2');
    });
  });

  describe('getAllVersions', () => {
    it('should return all versions for an aggregate', async () => {
      const event: CanvasEvent = {
        id: 'event-1',
        type: 'SquareCreated',
        timestamp: new Date(),
        aggregateId: 'canvas-1',
        version: 1,
        data: {
          squareId: 'square-1',
          x: 100,
          y: 100,
          size: 50,
          color: 'red',
        },
      };

      await service.saveEvent(event);
      const versions = await service.getAllVersions('canvas-1');

      expect(versions).toHaveLength(1);
      expect(versions[0].id).toBe('event-1');
      expect(versions[0].version).toBe(1);
    });
  });
}); 