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

export interface VersionInfo {
  id: string;
  timestamp: Date;
  version: number;
}

export interface CanvasEvent {
  id: string;
  type: string;
  timestamp: Date;
  aggregateId: string;
  version: number;
  data: any;
} 