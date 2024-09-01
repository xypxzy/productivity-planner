import { IsBoolean, IsNumber, IsOptional } from 'class-validator'

export class PomodoroTimerSessionDto {
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean
}

export class PomodoroTimerRoundDto {
  @IsNumber()
  totalSeconds: number

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean
}
