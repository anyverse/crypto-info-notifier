import { Module } from '@nestjs/common';
import { IntegrationModule } from 'src/integrations/integration.module';
import { PollTwitterTask } from './PollTwitterTask';

@Module({
  providers: [PollTwitterTask],
  imports: [IntegrationModule],
})
export class TasksModule {}
