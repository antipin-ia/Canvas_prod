import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;

  @Column()
  aggregateId: string;

  @Column()
  version: number;

  @Column('json')
  data: any;

  @CreateDateColumn()
  timestamp: Date;
} 