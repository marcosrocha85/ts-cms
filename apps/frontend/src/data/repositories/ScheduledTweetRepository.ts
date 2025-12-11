import { apiDataSource } from "@/src/data/datasources/ApiDataSource"
import { CreateScheduledTweetData, ScheduledTweet, TweetStats, UpdateScheduledTweetData } from "@domain/entities/ScheduledTweet"
import { FindAllParams, PaginatedResponse, ScheduledTweetRepository } from "@domain/repositories/ScheduledTweetRepository"

export class ScheduledTweetRepositoryImpl implements ScheduledTweetRepository {
    private baseUrl = "/scheduled-tweets"

    async create(data: CreateScheduledTweetData): Promise<ScheduledTweet> {
        const response = await apiDataSource.post<ScheduledTweet>(this.baseUrl, data)
        return {
            ...response.data,
            scheduledFor: new Date(response.data.scheduledFor),
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt)
        }
    }

    async findAll(params?: FindAllParams): Promise<PaginatedResponse<ScheduledTweet>> {
        const queryParams: any = {}
        if (params?.status) queryParams.status = params.status
        if (params?.search) queryParams.search = params.search
        if (params?.page) queryParams.page = params.page
        if (params?.limit) queryParams.limit = params.limit
        if (params?.dateFrom) queryParams.dateFrom = params.dateFrom
        if (params?.dateTo) queryParams.dateTo = params.dateTo

        const response = await apiDataSource.get<PaginatedResponse<ScheduledTweet>>(this.baseUrl, { params: queryParams })

        return {
            data: response.data.data.map((tweet) => ({
                ...tweet,
                scheduledFor: new Date(tweet.scheduledFor),
                createdAt: new Date(tweet.createdAt),
                updatedAt: new Date(tweet.updatedAt)
            })),
            meta: response.data.meta
        }
    }

    async findOne(id: number): Promise<ScheduledTweet> {
        const response = await apiDataSource.get<ScheduledTweet>(`${this.baseUrl}/${id}`)
        return {
            ...response.data,
            scheduledFor: new Date(response.data.scheduledFor),
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt)
        }
    }

    async update(id: number, data: UpdateScheduledTweetData): Promise<ScheduledTweet> {
        const response = await apiDataSource.patch<ScheduledTweet>(`${this.baseUrl}/${id}`, data)
        return {
            ...response.data,
            scheduledFor: new Date(response.data.scheduledFor),
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt)
        }
    }

    async remove(id: number): Promise<void> {
        await apiDataSource.delete(`${this.baseUrl}/${id}`)
    }

    async getStats(): Promise<TweetStats> {
        const response = await apiDataSource.get<TweetStats>(`${this.baseUrl}/stats`)
        return response.data
    }
}

export const scheduledTweetRepository = new ScheduledTweetRepositoryImpl()
