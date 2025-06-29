import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventStoreService } from './services/event-store.service';
import { CanvasGateway } from './gateways/canvas.gateway';
import { Event } from './entities/event.entity';
import { Snapshot } from './entities/snapshot.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'canvas_events',
      entities: [Event, Snapshot],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Event, Snapshot]),
  ],
  providers: [EventStoreService, CanvasGateway],
})
export class AppModule {} 