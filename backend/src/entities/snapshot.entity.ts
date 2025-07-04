import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('snapshots')
export class Snapshot {
  @PrimaryColumn()
  aggregateId: string;

  @PrimaryColumn()
  version: number;

  @Column('json')
  state: any;

  @CreateDateColumn()
  timestamp: Date;
} 