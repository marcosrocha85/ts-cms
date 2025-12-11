import { TweetStatus } from "../entities/scheduled-tweet.entity"

export class ScheduledTweetResponseDto {
    id: number
    text: string
    mediaPaths: string[] | null
    scheduledFor: Date
    status: TweetStatus
    tweetId: string | null
    errorMessage: string | null
    userId: number
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<ScheduledTweetResponseDto>) {
        Object.assign(this, partial)
    }
}
