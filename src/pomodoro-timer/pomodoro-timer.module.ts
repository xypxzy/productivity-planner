import { Module } from '@nestjs/common'
import { PomodoroTimerService } from './pomodoro-timer.service'
import { PomodoroTimerController } from './pomodoro-timer.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
  controllers: [PomodoroTimerController],
  providers: [PomodoroTimerService, PrismaService],
  exports: [PomodoroTimerService]
})
export class PomodoroTimerModule {}
