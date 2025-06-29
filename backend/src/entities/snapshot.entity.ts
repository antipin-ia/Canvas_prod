import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('snapshots')
@Index(['aggregateId', 'version'])
export class Snapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  aggregateId: string;

  @Column()
  version: number;

  @Column('jsonb')
  state: any;

  @CreateDateColumn()
  timestamp: Date;
} 