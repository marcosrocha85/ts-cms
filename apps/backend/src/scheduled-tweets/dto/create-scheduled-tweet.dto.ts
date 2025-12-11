import { IsNotEmpty, IsString, MaxLength, IsDateString, IsOptional, IsArray, IsEnum } from "class-validator"
import { TweetStatus } from "../entities/scheduled-tweet.entity"

export class CreateScheduledTweetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(25000)
  text: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaPaths?: string[]

  @IsNotEmpty()
  @IsDateString()
  scheduledFor: string

  @IsOptional()
  @IsEnum(["draft", "scheduled", "posted", "failed", "disabled"])
  status?: TweetStatus
}
