import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduledTweetsService } from "./scheduled-tweets.service"
import { ScheduledTweetsController } from "./scheduled-tweets.controller"
import { ScheduledTweet } from "./entities/scheduled-tweet.entity"
import { TwitterModule } from "../twitter/twitter.module"
import { MediaModule } from "../media/media.module"

@Module({
    imports: [
        TypeOrmModule.forFeature([ScheduledTweet]),
        TwitterModule,
        MediaModule
    ],
    controllers: [ScheduledTweetsController],
    providers: [ScheduledTweetsService],
    exports: [ScheduledTweetsService]
})
export class ScheduledTweetsModule {}
