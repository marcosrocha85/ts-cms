import { apiDataSource } from "@/src/data/datasources/ApiDataSource"
import { ScheduledTweetRepositoryImpl } from "@data/repositories/ScheduledTweetRepository"
import type { AxiosResponse } from "axios"

jest.mock("@/src/data/datasources/ApiDataSource", () => ({
    apiDataSource: {
        post: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn()
    }
}))

const apiDataSourceMock = apiDataSource as jest.Mocked<typeof apiDataSource>

const mockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { headers: {} } as AxiosResponse<T>["config"]
})

describe("ScheduledTweetRepository", () => {
    const repository = new ScheduledTweetRepositoryImpl()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should create a tweet and convert dates", async () => {
        apiDataSourceMock.post.mockResolvedValueOnce(
            mockAxiosResponse({
                id: 1,
                text: "hello",
                mediaPaths: [],
                scheduledFor: "2025-01-01T00:00:00Z",
                status: "scheduled",
                tweetId: null,
                errorMessage: null,
                createdAt: "2025-01-01T00:00:00Z",
                updatedAt: "2025-01-01T00:00:00Z"
            })
        )

        const result = await repository.create({ text: "hello", scheduledFor: "2025-01-01T00:00:00Z", status: "scheduled" })

        expect(apiDataSourceMock.post).toHaveBeenCalledWith("/scheduled-tweets", {
            text: "hello",
            scheduledFor: "2025-01-01T00:00:00Z",
            status: "scheduled"
        })
        expect(result.scheduledFor).toBeInstanceOf(Date)
        expect(result.createdAt).toBeInstanceOf(Date)
        expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it("should list tweets with pagination and convert dates", async () => {
        apiDataSourceMock.get.mockResolvedValueOnce(
            mockAxiosResponse({
                data: [
                    {
                        id: 1,
                        text: "hello",
                        mediaPaths: [],
                        scheduledFor: "2025-01-01T00:00:00Z",
                        status: "scheduled",
                        tweetId: null,
                        errorMessage: null,
                        createdAt: "2025-01-01T00:00:00Z",
                        updatedAt: "2025-01-01T00:00:00Z"
                    }
                ],
                meta: { total: 1, totalPages: 1 }
            })
        )

        const result = await repository.findAll({ status: "scheduled", page: 1, limit: 10 })

        expect(apiDataSourceMock.get).toHaveBeenCalledWith("/scheduled-tweets", {
            params: { status: "scheduled", page: 1, limit: 10 }
        })
        expect(result.data[0].scheduledFor).toBeInstanceOf(Date)
        expect(result.meta.total).toBe(1)
    })

    it("should get a tweet by id", async () => {
        apiDataSourceMock.get.mockResolvedValueOnce(
            mockAxiosResponse({
                id: 2,
                text: "single",
                mediaPaths: [],
                scheduledFor: "2025-02-01T00:00:00Z",
                status: "scheduled",
                tweetId: null,
                errorMessage: null,
                createdAt: "2025-02-01T00:00:00Z",
                updatedAt: "2025-02-01T00:00:00Z"
            })
        )

        const result = await repository.findOne(2)

        expect(apiDataSourceMock.get).toHaveBeenCalledWith("/scheduled-tweets/2")
        expect(result.id).toBe(2)
        expect(result.scheduledFor).toBeInstanceOf(Date)
    })

    it("should update a tweet and convert dates", async () => {
        apiDataSourceMock.patch.mockResolvedValueOnce(
            mockAxiosResponse({
                id: 1,
                text: "updated",
                mediaPaths: [],
                scheduledFor: "2025-03-01T00:00:00Z",
                status: "scheduled",
                tweetId: null,
                errorMessage: null,
                createdAt: "2025-01-01T00:00:00Z",
                updatedAt: "2025-03-01T00:00:00Z"
            })
        )

        const result = await repository.update(1, { text: "updated" })

        expect(apiDataSourceMock.patch).toHaveBeenCalledWith("/scheduled-tweets/1", { text: "updated" })
        expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it("should delete a tweet", async () => {
        apiDataSourceMock.delete.mockResolvedValueOnce(mockAxiosResponse(undefined))

        await repository.remove(3)

        expect(apiDataSourceMock.delete).toHaveBeenCalledWith("/scheduled-tweets/3")
    })

    it("should get stats", async () => {
        apiDataSourceMock.get.mockResolvedValueOnce(mockAxiosResponse({
            scheduled: 2,
            posted: 5,
            failed: 1,
            draft: 3
        }))

        const result = await repository.getStats()

        expect(apiDataSourceMock.get).toHaveBeenCalledWith("/scheduled-tweets/stats")
        expect(result.posted).toBe(5)
    })
})
