export type TweetStatus = "draft" | "scheduled" | "posted" | "failed" | "disabled"

export interface ScheduledTweet {
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
}

export interface CreateScheduledTweetData {
    text: string
    mediaPaths?: string[]
    scheduledFor: string
    status?: TweetStatus
}

export interface UpdateScheduledTweetData {
    text?: string
    mediaPaths?: string[]
    scheduledFor?: string
    status?: TweetStatus
}

export interface TweetStats {
    total: number
    scheduled: number
    posted: number
    failed: number
    draft: number
}
