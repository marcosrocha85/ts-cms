import { CreateScheduledTweetData, ScheduledTweet, TweetStats, TweetStatus, UpdateScheduledTweetData } from "@domain/entities/ScheduledTweet"

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface FindAllParams {
    status?: TweetStatus
    search?: string
    page?: number
    limit?: number
    dateFrom?: string
    dateTo?: string
}

export interface ScheduledTweetRepository {
    create(data: CreateScheduledTweetData): Promise<ScheduledTweet>
    findAll(params?: FindAllParams): Promise<PaginatedResponse<ScheduledTweet>>
    findOne(id: number): Promise<ScheduledTweet>
    update(id: number, data: UpdateScheduledTweetData): Promise<ScheduledTweet>
    remove(id: number): Promise<void>
    getStats(): Promise<TweetStats>
}
