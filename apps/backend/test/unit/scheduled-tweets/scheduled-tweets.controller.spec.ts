import { Test, TestingModule } from "@nestjs/testing"
import { ScheduledTweetsController } from "../../../src/scheduled-tweets/scheduled-tweets.controller"
import { ScheduledTweetsService } from "../../../src/scheduled-tweets/scheduled-tweets.service"
import { CreateScheduledTweetDto } from "../../../src/scheduled-tweets/dto/create-scheduled-tweet.dto"
import { UpdateScheduledTweetDto } from "../../../src/scheduled-tweets/dto/update-scheduled-tweet.dto"
import { ScheduledTweetResponseDto } from "../../../src/scheduled-tweets/dto/scheduled-tweet-response.dto"

describe("ScheduledTweetsController", () => {
    let controller: ScheduledTweetsController

    const mockScheduledTweetsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        toggleStatus: jest.fn(),
        getStats: jest.fn()
    }

    const mockTweetResponse: ScheduledTweetResponseDto = {
        id: 1,
        text: "Test tweet",
        mediaPaths: [],
        scheduledFor: new Date(),
        status: "draft",
        userId: 1,
        tweetId: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ScheduledTweetsController],
            providers: [
                {
                    provide: ScheduledTweetsService,
                    useValue: mockScheduledTweetsService
                }
            ]
        }).compile()

        controller = module.get<ScheduledTweetsController>(ScheduledTweetsController)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })

    describe("create", () => {
        it("should create a new scheduled tweet", async () => {
            const createDto: CreateScheduledTweetDto = {
                text: "Test tweet",
                scheduledFor: new Date().toISOString(),
                status: "draft",
                mediaPaths: []
            }

            const req = { user: { userId: 1 } }
            mockScheduledTweetsService.create.mockResolvedValue(mockTweetResponse)

            const result = await controller.create(createDto, req)

            expect(result).toEqual(mockTweetResponse)
            expect(mockScheduledTweetsService.create).toHaveBeenCalledWith(createDto, 1)
        })
    })

    describe("findAll", () => {
        it("should return all tweets for user", async () => {
            const req = { user: { userId: 1 } }
            mockScheduledTweetsService.findAll.mockResolvedValue([mockTweetResponse])

            const result = await controller.findAll(req)

            expect(result).toEqual([mockTweetResponse])
            expect(mockScheduledTweetsService.findAll).toHaveBeenCalledWith(1, undefined, undefined)
        })

        it("should filter tweets by status", async () => {
            const req = { user: { userId: 1 } }
            mockScheduledTweetsService.findAll.mockResolvedValue([mockTweetResponse])

            const result = await controller.findAll(req, "draft")

            expect(result).toEqual([mockTweetResponse])
            expect(mockScheduledTweetsService.findAll).toHaveBeenCalledWith(1, "draft", undefined)
        })

        it("should search tweets by text", async () => {
            const req = { user: { userId: 1 } }
            mockScheduledTweetsService.findAll.mockResolvedValue([mockTweetResponse])

            const result = await controller.findAll(req, undefined, "search term")

            expect(result).toEqual([mockTweetResponse])
            expect(mockScheduledTweetsService.findAll).toHaveBeenCalledWith(1, undefined, "search term")
        })
    })

    describe("findOne", () => {
        it("should return a single tweet", async () => {
            const req = { user: { userId: 1 } }
            mockScheduledTweetsService.findOne.mockResolvedValue(mockTweetResponse)

            const result = await controller.findOne(1, req)

            expect(result).toEqual(mockTweetResponse)
            expect(mockScheduledTweetsService.findOne).toHaveBeenCalledWith(1, 1)
        })
    })

    describe("update", () => {
        it("should update a tweet", async () => {
            const updateDto: UpdateScheduledTweetDto = {
                text: "Updated tweet"
            }
            const req = { user: { userId: 1 } }
            const updatedTweet = { ...mockTweetResponse, text: "Updated tweet" }
            mockScheduledTweetsService.update.mockResolvedValue(updatedTweet)

            const result = await controller.update(1, updateDto, req)

            expect(result).toEqual(updatedTweet)
            expect(mockScheduledTweetsService.update).toHaveBeenCalledWith(1, updateDto, 1)
        })
    })

    describe("remove", () => {
        it("should delete a tweet", async () => {
            const req = { user: { userId: 1 } }
            mockScheduledTweetsService.remove.mockResolvedValue({ message: "Tweet deleted successfully" })

            const result = await controller.remove(1, req)

            expect(result).toEqual({ message: "Tweet deleted successfully" })
            expect(mockScheduledTweetsService.remove).toHaveBeenCalledWith(1, 1)
        })
    })

    describe("getStats", () => {
        it("should return tweet statistics", async () => {
            const req = { user: { userId: 1 } }
            const stats = {
                total: 10,
                scheduled: 5,
                posted: 3,
                failed: 1,
                draft: 1
            }
            mockScheduledTweetsService.getStats.mockResolvedValue(stats)

            const result = await controller.getStats(req)

            expect(result).toEqual(stats)
            expect(mockScheduledTweetsService.getStats).toHaveBeenCalledWith(1)
        })
    })
})
