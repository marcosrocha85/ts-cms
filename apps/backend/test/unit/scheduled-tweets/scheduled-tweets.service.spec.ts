import { Test, TestingModule } from "@nestjs/testing"
import { NotFoundException, BadRequestException } from "@nestjs/common"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ScheduledTweetsService } from "../../../src/scheduled-tweets/scheduled-tweets.service"
import { ScheduledTweet, TweetStatus } from "../../../src/scheduled-tweets/entities/scheduled-tweet.entity"
import { TwitterService } from "../../../src/twitter/twitter.service"
import { MediaService } from "../../../src/media/media.service"
import { CreateScheduledTweetDto } from "../../../src/scheduled-tweets/dto/create-scheduled-tweet.dto"
import { UpdateScheduledTweetDto } from "../../../src/scheduled-tweets/dto/update-scheduled-tweet.dto"

describe("ScheduledTweetsService", () => {
    let service: ScheduledTweetsService

    const mockScheduledTweet: ScheduledTweet = {
        id: 1,
        text: "Test tweet",
        mediaPaths: [],
        scheduledFor: new Date(Date.now() + 3600000), // 1 hour from now
        status: "draft" as TweetStatus,
        userId: 1,
        user: null,
        tweetId: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        createQueryBuilder: jest.fn(),
        delete: jest.fn(),
        remove: jest.fn(),
        count: jest.fn()
    }

    const mockTwitterService = {
        scheduleTweet: jest.fn(),
        postTweet: jest.fn(),
        deleteTweet: jest.fn()
    }

    const mockMediaService = {
        uploadMedia: jest.fn(),
        deleteFile: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScheduledTweetsService,
                {
                    provide: getRepositoryToken(ScheduledTweet),
                    useValue: mockRepository
                },
                {
                    provide: TwitterService,
                    useValue: mockTwitterService
                },
                {
                    provide: MediaService,
                    useValue: mockMediaService
                }
            ]
        }).compile()

        service = module.get<ScheduledTweetsService>(ScheduledTweetsService)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("create", () => {
        it("should create a draft tweet", async () => {
            const createDto: CreateScheduledTweetDto = {
                text: "Test tweet",
                scheduledFor: new Date(Date.now() + 3600000).toISOString(),
                status: "draft",
                mediaPaths: []
            }

            mockRepository.create.mockReturnValue(mockScheduledTweet)
            mockRepository.save.mockResolvedValue(mockScheduledTweet)

            const result = await service.create(createDto, 1)

            expect(result).toBeDefined()
            expect(result.text).toBe(createDto.text)
            expect(mockRepository.create).toHaveBeenCalled()
            expect(mockRepository.save).toHaveBeenCalled()
            expect(mockTwitterService.scheduleTweet).not.toHaveBeenCalled()
            expect(mockTwitterService.postTweet).not.toHaveBeenCalled()
        })

        it("should schedule a tweet when status is scheduled", async () => {
            const futureDate = new Date(Date.now() + 600000) // 10 minutes from now
            const createDto: CreateScheduledTweetDto = {
                text: "Scheduled tweet",
                scheduledFor: futureDate.toISOString(),
                status: "scheduled",
                mediaPaths: []
            }

            const scheduledTweet = {
                ...mockScheduledTweet,
                status: "scheduled" as TweetStatus,
                scheduledFor: futureDate
            }

            mockRepository.create.mockReturnValue(scheduledTweet)
            mockRepository.save.mockResolvedValue(scheduledTweet)
            mockTwitterService.scheduleTweet.mockResolvedValue({ id: "twitter123" })

            const result = await service.create(createDto, 1)

            expect(result).toBeDefined()
            expect(mockTwitterService.scheduleTweet).toHaveBeenCalledWith(1, {
                text: scheduledTweet.text,
                scheduledAt: scheduledTweet.scheduledFor,
                mediaIds: scheduledTweet.mediaPaths
            })
        })

        it("should post immediately when scheduled time is less than 5 minutes", async () => {
            const nearFutureDate = new Date(Date.now() + 120000) // 2 minutes from now
            const createDto: CreateScheduledTweetDto = {
                text: "Immediate tweet",
                scheduledFor: nearFutureDate.toISOString(),
                status: "scheduled",
                mediaPaths: []
            }

            const tweet = {
                ...mockScheduledTweet,
                scheduledFor: nearFutureDate
            }

            mockRepository.create.mockReturnValue(tweet)
            mockRepository.save.mockResolvedValue({ ...tweet, tweetId: "posted123", status: "posted" })
            mockTwitterService.postTweet.mockResolvedValue({ id: "posted123" })

            await service.create(createDto, 1)

            expect(mockTwitterService.postTweet).toHaveBeenCalledWith(1, {
                text: tweet.text,
                mediaIds: tweet.mediaPaths
            })
        })

        it("should post immediately when status is posted", async () => {
            const futureDate = new Date(Date.now() + 3600000)
            const createDto: CreateScheduledTweetDto = {
                text: "Post now tweet",
                scheduledFor: futureDate.toISOString(),
                status: "posted", // Explicit posted status
                mediaPaths: []
            }

            const tweet = {
                ...mockScheduledTweet,
                scheduledFor: futureDate,
                status: "posted" as TweetStatus
            }

            mockRepository.create.mockReturnValue(tweet)
            mockRepository.save.mockResolvedValue({ ...tweet, tweetId: "posted456" })
            mockTwitterService.postTweet.mockResolvedValue({ id: "posted456" })

            await service.create(createDto, 1)

            expect(mockTwitterService.postTweet).toHaveBeenCalled()
        })

        it("should mark as failed when scheduling fails", async () => {
            const futureDate = new Date(Date.now() + 600000)
            const createDto: CreateScheduledTweetDto = {
                text: "Failing tweet",
                scheduledFor: futureDate.toISOString(),
                status: "scheduled",
                mediaPaths: []
            }

            const scheduledTweet = {
                ...mockScheduledTweet,
                status: "scheduled" as TweetStatus,
                scheduledFor: futureDate
            }

            mockRepository.create.mockReturnValue(scheduledTweet)
            mockRepository.save.mockResolvedValue(scheduledTweet)
            mockTwitterService.scheduleTweet.mockRejectedValue(new Error("Twitter API error"))

            await expect(service.create(createDto, 1)).rejects.toThrow(BadRequestException)

            // Verify it saved with failed status
            const saveCall = mockRepository.save.mock.calls[1][0]
            expect(saveCall.status).toBe("failed")
            expect(saveCall.errorMessage).toBe("Twitter API error")
        })

        it("should mark as failed when posting fails", async () => {
            const nearDate = new Date(Date.now() + 120000)
            const createDto: CreateScheduledTweetDto = {
                text: "Failing post",
                scheduledFor: nearDate.toISOString(),
                status: "draft",
                mediaPaths: []
            }

            const tweet = {
                ...mockScheduledTweet,
                scheduledFor: nearDate
            }

            mockRepository.create.mockReturnValue(tweet)
            mockRepository.save.mockResolvedValue(tweet)
            mockTwitterService.postTweet.mockRejectedValue(new Error("Post error"))

            await expect(service.create(createDto, 1)).rejects.toThrow(BadRequestException)
        })
    })

    describe("findAll", () => {
        it("should return all tweets for user", async () => {
            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([mockScheduledTweet])
            }

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

            const result = await service.findAll(1)

            expect(result).toBeDefined()
            expect(Array.isArray(result)).toBe(true)
            expect(mockQueryBuilder.where).toHaveBeenCalledWith("tweet.userId = :userId", { userId: 1 })
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("tweet.scheduledFor", "ASC")
        })

        it("should filter by status", async () => {
            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([mockScheduledTweet])
            }

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

            await service.findAll(1, "draft")

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("tweet.status = :status", { status: "draft" })
        })

        it("should filter by search text", async () => {
            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([mockScheduledTweet])
            }

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

            await service.findAll(1, undefined, "test search")

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                "tweet.text LIKE :search",
                { search: "%test search%" }
            )
        })

        it("should filter by both status and search", async () => {
            const mockQueryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([mockScheduledTweet])
            }

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

            await service.findAll(1, "scheduled", "important")

            expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2)
        })
    })

    describe("findOne", () => {
        it("should return a tweet by id", async () => {
            mockRepository.findOne.mockResolvedValue(mockScheduledTweet)

            const result = await service.findOne(1, 1)

            expect(result).toBeDefined()
            expect(result.id).toBe(1)
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1, userId: 1 }
            })
        })

        it("should throw NotFoundException when tweet not found", async () => {
            mockRepository.findOne.mockResolvedValue(null)

            await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException)
        })
    })

    describe("update", () => {
        it("should update a tweet", async () => {
            const updateDto: UpdateScheduledTweetDto = {
                text: "Updated tweet"
            }

            mockRepository.findOne.mockResolvedValue(mockScheduledTweet)
            mockRepository.save.mockResolvedValue({ ...mockScheduledTweet, text: "Updated tweet" })

            const result = await service.update(1, updateDto, 1)

            expect(result).toBeDefined()
            expect(result.text).toBe("Updated tweet")
        })

        it("should throw NotFoundException when updating non-existent tweet", async () => {
            mockRepository.findOne.mockResolvedValue(null)

            await expect(service.update(999, { text: "Updated" }, 1)).rejects.toThrow(NotFoundException)
        })

        it("should throw ForbiddenException when trying to edit posted tweet", async () => {
            const postedTweet = {
                ...mockScheduledTweet,
                status: "posted" as TweetStatus,
                tweetId: "posted123"
            }

            mockRepository.findOne.mockResolvedValue(postedTweet)

            await expect(service.update(1, { text: "New text" }, 1))
                .rejects.toThrow("Cannot edit a tweet that has already been posted")
        })

        it("should delete and reschedule when updating scheduled tweet", async () => {
            const scheduledTweet = {
                ...mockScheduledTweet,
                status: "scheduled" as TweetStatus,
                tweetId: "scheduled123"
            }

            const updateDto: UpdateScheduledTweetDto = {
                text: "Updated scheduled tweet",
                scheduledFor: new Date(Date.now() + 7200000).toISOString() // 2 hours
            }

            mockRepository.findOne.mockResolvedValue(scheduledTweet)
            mockRepository.save.mockResolvedValue({ ...scheduledTweet, text: updateDto.text })
            mockTwitterService.deleteTweet.mockResolvedValue({ deleted: true, alreadyDeleted: false })
            mockTwitterService.scheduleTweet.mockResolvedValue({ id: "new-scheduled-id" })

            const result = await service.update(1, updateDto, 1)

            expect(mockTwitterService.deleteTweet).toHaveBeenCalledWith(1, "scheduled123")
            expect(mockTwitterService.scheduleTweet).toHaveBeenCalled()
            expect(result).toBeDefined()
        })

        it("should auto-recover from failed to scheduled when updating date to future", async () => {
            const failedTweet = {
                ...mockScheduledTweet,
                status: "failed" as TweetStatus,
                errorMessage: "Previous error"
            }

            const futureDate = new Date(Date.now() + 3600000).toISOString()
            const updateDto: UpdateScheduledTweetDto = {
                scheduledFor: futureDate
            }

            mockRepository.findOne.mockResolvedValue(failedTweet)
            mockRepository.save.mockResolvedValue({
                ...failedTweet,
                scheduledFor: new Date(futureDate),
                status: "scheduled",
                errorMessage: null
            })
            mockTwitterService.scheduleTweet.mockResolvedValue({ id: "recovered-id" })

            const result = await service.update(1, updateDto, 1)

            expect(result.status).toBe("scheduled")
            expect(mockTwitterService.scheduleTweet).toHaveBeenCalled()
        })

        it("should not auto-recover when status is explicitly set", async () => {
            const failedTweet = {
                ...mockScheduledTweet,
                status: "failed" as TweetStatus
            }

            const updateDto: UpdateScheduledTweetDto = {
                scheduledFor: new Date(Date.now() + 3600000).toISOString(),
                status: "draft" // Explicitly set to draft
            }

            mockRepository.findOne.mockResolvedValue(failedTweet)
            mockRepository.save.mockResolvedValue({
                ...failedTweet,
                status: "draft"
            })

            const result = await service.update(1, updateDto, 1)

            expect(result.status).toBe("draft")
            expect(mockTwitterService.scheduleTweet).not.toHaveBeenCalled()
        })

        it("should handle error when deleting tweet during rescheduling", async () => {
            const scheduledTweet = {
                ...mockScheduledTweet,
                status: "scheduled" as TweetStatus,
                tweetId: "scheduled123"
            }

            mockRepository.findOne.mockResolvedValue(scheduledTweet)
            mockTwitterService.deleteTweet.mockRejectedValue(new Error("Delete failed"))
            mockTwitterService.scheduleTweet.mockResolvedValue({ id: "new-id" })
            mockRepository.save.mockResolvedValue(scheduledTweet)

            // Should continue even if delete fails
            const result = await service.update(1, { text: "Updated" }, 1)

            expect(result).toBeDefined()
        })

        it("should mark as failed when rescheduling fails", async () => {
            const scheduledTweet = {
                ...mockScheduledTweet,
                status: "draft" as TweetStatus
            }

            const updateDto: UpdateScheduledTweetDto = {
                status: "scheduled",
                scheduledFor: new Date(Date.now() + 3600000).toISOString()
            }

            mockRepository.findOne.mockResolvedValue(scheduledTweet)
            mockTwitterService.scheduleTweet.mockRejectedValue(new Error("Schedule failed"))
            mockRepository.save.mockResolvedValue({ ...scheduledTweet, status: "failed" })

            await expect(service.update(1, updateDto, 1))
                .rejects.toThrow("Failed to schedule tweet on Twitter")
        })
    })

    describe("remove", () => {
        it("should delete a tweet without tweetId", async () => {
            mockRepository.findOne.mockResolvedValue(mockScheduledTweet)
            mockRepository.remove.mockResolvedValue(mockScheduledTweet)

            await service.remove(1, 1)

            expect(mockRepository.remove).toHaveBeenCalledWith(mockScheduledTweet)
            expect(mockTwitterService.deleteTweet).not.toHaveBeenCalled()
        })

        it("should delete tweet from Twitter when tweetId exists", async () => {
            const tweetWithId = {
                ...mockScheduledTweet,
                tweetId: "twitter123"
            }

            mockRepository.findOne.mockResolvedValue(tweetWithId)
            mockRepository.remove.mockResolvedValue(tweetWithId)
            mockTwitterService.deleteTweet.mockResolvedValue({ deleted: true, alreadyDeleted: false })

            await service.remove(1, 1)

            expect(mockTwitterService.deleteTweet).toHaveBeenCalledWith(1, "twitter123")
            expect(mockRepository.remove).toHaveBeenCalledWith(tweetWithId)
        })

        it("should handle when tweet already deleted from Twitter", async () => {
            const tweetWithId = {
                ...mockScheduledTweet,
                tweetId: "twitter123"
            }

            mockRepository.findOne.mockResolvedValue(tweetWithId)
            mockRepository.remove.mockResolvedValue(tweetWithId)
            mockTwitterService.deleteTweet.mockResolvedValue({ deleted: true, alreadyDeleted: true })

            await service.remove(1, 1)

            expect(mockTwitterService.deleteTweet).toHaveBeenCalled()
            expect(mockRepository.remove).toHaveBeenCalled()
        })

        it("should continue removing from DB even if Twitter delete fails", async () => {
            const tweetWithId = {
                ...mockScheduledTweet,
                tweetId: "twitter123"
            }

            mockRepository.findOne.mockResolvedValue(tweetWithId)
            mockRepository.remove.mockResolvedValue(tweetWithId)
            mockTwitterService.deleteTweet.mockRejectedValue(new Error("Twitter API error"))

            await service.remove(1, 1)

            expect(mockRepository.remove).toHaveBeenCalledWith(tweetWithId)
        })

        it("should delete media files when tweet is not posted", async () => {
            const draftTweetWithMedia = {
                ...mockScheduledTweet,
                status: "draft" as TweetStatus,
                mediaPaths: ["uploads/image1.jpg", "uploads/image2.png"]
            }

            mockRepository.findOne.mockResolvedValue(draftTweetWithMedia)
            mockRepository.remove.mockResolvedValue(draftTweetWithMedia)
            mockMediaService.deleteFile.mockResolvedValue(undefined)

            await service.remove(1, 1)

            expect(mockMediaService.deleteFile).toHaveBeenCalledTimes(2)
            expect(mockMediaService.deleteFile).toHaveBeenCalledWith("image1.jpg")
            expect(mockMediaService.deleteFile).toHaveBeenCalledWith("image2.png")
        })

        it("should not delete media files when tweet is posted", async () => {
            const postedTweetWithMedia = {
                ...mockScheduledTweet,
                status: "posted" as TweetStatus,
                tweetId: "posted123",
                mediaPaths: ["uploads/image1.jpg"]
            }

            mockRepository.findOne.mockResolvedValue(postedTweetWithMedia)
            mockRepository.remove.mockResolvedValue(postedTweetWithMedia)
            mockTwitterService.deleteTweet.mockResolvedValue({ deleted: true, alreadyDeleted: false })

            await service.remove(1, 1)

            expect(mockMediaService.deleteFile).not.toHaveBeenCalled()
        })

        it("should continue removing tweet even if media cleanup fails", async () => {
            const tweetWithMedia = {
                ...mockScheduledTweet,
                mediaPaths: ["uploads/image1.jpg"]
            }

            mockRepository.findOne.mockResolvedValue(tweetWithMedia)
            mockRepository.remove.mockResolvedValue(tweetWithMedia)
            mockMediaService.deleteFile.mockRejectedValue(new Error("File not found"))

            await service.remove(1, 1)

            expect(mockRepository.remove).toHaveBeenCalledWith(tweetWithMedia)
        })

        it("should throw NotFoundException when deleting non-existent tweet", async () => {
            mockRepository.findOne.mockResolvedValue(null)

            await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException)
        })
    })

    describe("getStats", () => {
        it("should return tweet statistics", async () => {
            mockRepository.count
                .mockResolvedValueOnce(5)  // total
                .mockResolvedValueOnce(2)  // scheduled
                .mockResolvedValueOnce(1)  // posted today
                .mockResolvedValueOnce(0)  // failed

            const result = await service.getStats(1)

            expect(result).toBeDefined()
            expect(result.total).toBe(5)
            expect(result.scheduled).toBe(2)
            expect(result.posted).toBe(1)
            expect(result.failed).toBe(0)
        })
    })
})
