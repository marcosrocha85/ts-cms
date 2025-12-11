import { PartialType } from "@nestjs/mapped-types"
import { CreateScheduledTweetDto } from "./create-scheduled-tweet.dto"
import { IsOptional, IsEnum } from "class-validator"
import { TweetStatus } from "../entities/scheduled-tweet.entity"

export class UpdateScheduledTweetDto extends PartialType(CreateScheduledTweetDto) {
  @IsOptional()
  @IsEnum(["draft", "scheduled", "posted", "failed", "disabled"])
  status?: TweetStatus
}
