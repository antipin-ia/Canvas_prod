import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStoreService } from './event-store.service';
import { Event } from '../entities/event.entity';
import { Snapshot } from '../entities/snapshot.entity';
import { CanvasEvent, CanvasState } from '../types/events';

describe('EventStoreService', () => {
  let service: EventStoreService;
  let eventRepository: Repository<Event>;
  let snapshotRepository: Repository<Snapshot>;

  const mockEventRepository = {
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  const mockSnapshotRepository = {
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventStoreService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(Snapshot),
          useValue: mockSnapshotRepository,
        },
      ],
    }).compile();

    service = module.get<EventStoreService>(EventStoreService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    snapshotRepository = module.get<Repository<Snapshot>>(getRepositoryToken(Snapshot));
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

      mockEventRepository.save.mockResolvedValue(event);

      await service.saveEvent(event);

      expect(mockEventRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: event.id,
        type: event.type,
        aggregateId: event.aggregateId,
        version: event.version,
        data: event.data,
      }));
    });

    it('should create snapshot every 10 events', async () => {
      const event: CanvasEvent = {
        id: 'test-id',
        type: 'SquareCreated',
        timestamp: new Date(),
        aggregateId: 'canvas-1',
        version: 10, // 10th event
        data: {
          squareId: 'square-1',
          x: 100,
          y: 100,
          size: 50,
          color: 'red',
        },
      };

      mockEventRepository.save.mockResolvedValue(event);
      mockSnapshotRepository.save.mockResolvedValue({});

      await service.saveEvent(event);

      expect(mockEventRepository.save).toHaveBeenCalled();
      expect(mockSnapshotRepository.save).toHaveBeenCalled();
    });
  });

  describe('getStateAtVersion', () => {
    it('should return initial state when no events exist', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockSnapshotRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

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
        },
        {
          id: 'event-2',
          type: 'SquareMoved',
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

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
        getMany: jest.fn().mockResolvedValue(events),
      };

      mockSnapshotRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getStateAtVersion('canvas-1');

      expect(result.squares).toHaveLength(1);
      expect(result.squares[0]).toEqual({
        id: 'square-1',
        x: 200, // Updated position
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
      const versions = [
        { id: 'event-1', timestamp: new Date(), version: 1 },
        { id: 'event-2', timestamp: new Date(), version: 2 },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(versions),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllVersions('canvas-1');

      expect(result).toEqual(versions);
    });
  });
}); 