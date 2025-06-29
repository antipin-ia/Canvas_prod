export interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  aggregateId: string;
  version: number;
  data: any;
}

export interface SquareCreatedEvent extends BaseEvent {
  type: 'SquareCreated';
  data: {
    squareId: string;
    x: number;
    y: number;
    size: number;
    color: string;
  };
}

export interface SquareMovedEvent extends BaseEvent {
  type: 'SquareMoved';
  data: {
    squareId: string;
    x: number;
    y: number;
  };
}

export interface SquareDeletedEvent extends BaseEvent {
  type: 'SquareDeleted';
  data: {
    squareId: string;
  };
}

export type CanvasEvent = SquareCreatedEvent | SquareMovedEvent | SquareDeletedEvent;

export interface Square {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
}

export interface CanvasState {
  squares: Square[];
  version: number;
  lastEventId: string;
} 