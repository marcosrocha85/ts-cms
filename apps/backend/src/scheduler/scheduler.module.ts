import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TweetSchedulerService } from "./tweet-scheduler.service"
import { ScheduledTweet } from "../scheduled-tweets/entities/scheduled-tweet.entity"
import { TwitterModule } from "../twitter/twitter.module"
import { MediaModule } from "../media/media.module"

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([ScheduledTweet]),
        TwitterModule,
        MediaModule
    ],
    providers: [TweetSchedulerService]
})
export class SchedulerModule { }
