import { Module } from '@nestjs/common';
import { EventStoreService } from './services/event-store.service';
import { CanvasGateway } from './gateways/canvas.gateway';

@Module({
  imports: [],
  providers: [EventStoreService, CanvasGateway],
})
export class AppModule {} 