import { Test, TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import { getRepositoryToken } from "@nestjs/typeorm"
import { TwitterService } from "../../../src/twitter/twitter.service"
import { User } from "../../../src/auth/entities/user.entity"

describe("TwitterService", () => {
    let service: TwitterService

    const mockUser = {
        id: 1,
        email: "test@example.com",
        twitterAccessToken: "valid-access-token",
        twitterRefreshToken: "valid-refresh-token",
        twitterUsername: "testuser",
        twitterVerifiedType: "blue",
        maxTweetChars: 25000
    }

    const mockUserRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn()
    }

    const mockConfigService = {
        get: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TwitterService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                }
            ]
        }).compile()

        service = module.get<TwitterService>(TwitterService)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("updateUserTwitterProfile", () => {
        it("should update user profile with Twitter data for verified blue user", async () => {
            const twitterData = {
                id: "123456789",
                username: "testuser",
                verified: true,
                verified_type: "blue"
            }

            mockUserRepository.findOne.mockResolvedValue(mockUser)
            mockUserRepository.save.mockResolvedValue({
                ...mockUser,
                twitterUsername: "testuser",
                twitterVerifiedType: "blue",
                maxTweetChars: 25000
            })

            const result = await service.updateUserTwitterProfile(1, twitterData)

            expect(result.maxTweetChars).toBe(25000)
            expect(result.twitterVerifiedType).toBe("blue")
            expect(mockUserRepository.save).toHaveBeenCalled()
        })

        it("should set maxTweetChars to 4000 for business verified users", async () => {
            const twitterData = {
                id: "123456789",
                username: "businessuser",
                verified: true,
                verified_type: "business"
            }

            mockUserRepository.findOne.mockResolvedValue(mockUser)
            mockUserRepository.save.mockResolvedValue({
                ...mockUser,
                twitterUsername: "businessuser",
                twitterVerifiedType: "business",
                maxTweetChars: 4000
            })

            const result = await service.updateUserTwitterProfile(1, twitterData)

            expect(result.maxTweetChars).toBe(4000)
            expect(result.twitterVerifiedType).toBe("business")
        })

        it("should set maxTweetChars to 280 for unverified users", async () => {
            const twitterData = {
                id: "987654321",
                username: "regularuser",
                verified: false
            }

            mockUserRepository.findOne.mockResolvedValue(mockUser)
            mockUserRepository.save.mockResolvedValue({
                ...mockUser,
                twitterUsername: "regularuser",
                twitterVerifiedType: "none",
                maxTweetChars: 280
            })

            const result = await service.updateUserTwitterProfile(1, twitterData)

            expect(result.maxTweetChars).toBe(280)
        })

        it("should throw error when user not found", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            await expect(service.updateUserTwitterProfile(999, {} as any))
                .rejects.toThrow("User not found")
        })
    })

    describe("getUserMaxChars", () => {
        it("should return user's maxTweetChars when user exists", async () => {
            mockUserRepository.findOne.mockResolvedValue({ maxTweetChars: 25000 })

            const result = await service.getUserMaxChars(1)

            expect(result).toBe(25000)
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                select: ["maxTweetChars"]
            })
        })

        it("should return default 280 when user has no maxTweetChars set", async () => {
            mockUserRepository.findOne.mockResolvedValue({ maxTweetChars: null })

            const result = await service.getUserMaxChars(1)

            expect(result).toBe(280)
        })

        it("should return default 280 when user not found", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            const result = await service.getUserMaxChars(999)

            expect(result).toBe(280)
        })
    })

    describe("scheduleTweet", () => {
        it("should validate and return scheduled tweet data for future date", async () => {
            const futureDate = new Date(Date.now() + 600000) // 10 minutes
            const params = {
                text: "Scheduled tweet",
                scheduledAt: futureDate,
                mediaIds: []
            }

            const result = await service.scheduleTweet(1, params)

            expect(result).toHaveProperty("id")
            expect(result.id).toContain("scheduled_")
            expect(result).toHaveProperty("text", "Scheduled tweet")
            expect(result).toHaveProperty("scheduled_at")
            expect(new Date(result.scheduled_at)).toEqual(futureDate)
        })

        it("should accept date exactly 5 minutes in the future", async () => {
            const futureDate = new Date(Date.now() + 5 * 60 * 1000 + 1000) // 5 min + 1 sec
            const params = {
                text: "Exactly 5 min tweet",
                scheduledAt: futureDate,
                mediaIds: []
            }

            const result = await service.scheduleTweet(1, params)

            expect(result.text).toBe("Exactly 5 min tweet")
        })

        it("should throw error when scheduled time is less than 5 minutes", async () => {
            const nearFuture = new Date(Date.now() + 120000) // 2 minutes
            const params = {
                text: "Too soon",
                scheduledAt: nearFuture,
                mediaIds: []
            }

            await expect(service.scheduleTweet(1, params))
                .rejects.toThrow("Scheduled time must be at least 5 minutes in the future")
        })

        it("should throw error when scheduled time is in the past", async () => {
            const pastDate = new Date(Date.now() - 3600000) // 1 hour ago
            const params = {
                text: "Past tweet",
                scheduledAt: pastDate,
                mediaIds: []
            }

            await expect(service.scheduleTweet(1, params))
                .rejects.toThrow("Scheduled time must be at least 5 minutes in the future")
        })

        it("should throw error when scheduled time is exactly now", async () => {
            const now = new Date()
            const params = {
                text: "Now tweet",
                scheduledAt: now,
                mediaIds: []
            }

            await expect(service.scheduleTweet(1, params))
                .rejects.toThrow("Scheduled time must be at least 5 minutes in the future")
        })
    })

    describe("uploadMedia", () => {
        it("should return empty array when no media paths provided", async () => {
            const result = await service.uploadMedia(1, [])

            expect(result).toEqual([])
            expect(mockUserRepository.findOne).not.toHaveBeenCalled()
        })

        it("should return empty array when media paths is null", async () => {
            const result = await service.uploadMedia(1, null as any)

            expect(result).toEqual([])
        })

        it("should throw error when user not connected to Twitter", async () => {
            mockUserRepository.findOne.mockResolvedValue({ twitterAccessToken: null })

            await expect(service.uploadMedia(1, ["uploads/image.jpg"]))
                .rejects.toThrow("User not connected to Twitter")
        })
    })

    describe("saveUserTokens", () => {
        it("should save access token only", async () => {
            await service.saveUserTokens(1, "new-access-token")

            expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
                twitterAccessToken: "new-access-token",
                twitterRefreshToken: undefined
            })
        })

        it("should save both access and refresh tokens", async () => {
            await service.saveUserTokens(1, "new-access-token", "new-refresh-token")

            expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
                twitterAccessToken: "new-access-token",
                twitterRefreshToken: "new-refresh-token"
            })
        })
    })

    describe("disconnectTwitterAccount", () => {
        it("should remove all Twitter-related data from user", async () => {
            await service.disconnectTwitterAccount(1)

            expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
                twitterAccessToken: null,
                twitterRefreshToken: null,
                twitterUsername: null,
                twitterVerifiedType: null,
                maxTweetChars: 280
            })
        })

        it("should reset maxTweetChars to default 280", async () => {
            await service.disconnectTwitterAccount(1)

            const updateCall = mockUserRepository.update.mock.calls[0][1]
            expect(updateCall.maxTweetChars).toBe(280)
        })
    })

    describe("getTwitterConnectionStatus", () => {
        it("should return connected status with user data", async () => {
            mockUserRepository.findOne.mockResolvedValue({
                twitterUsername: "testuser",
                twitterVerifiedType: "blue",
                maxTweetChars: 25000,
                twitterAccessToken: "token123"
            })

            const result = await service.getTwitterConnectionStatus(1)

            expect(result).toEqual({
                connected: true,
                username: "testuser",
                verifiedType: "blue",
                maxTweetChars: 25000
            })
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                select: ["twitterUsername", "twitterVerifiedType", "maxTweetChars", "twitterAccessToken"]
            })
        })

        it("should return disconnected status when no access token", async () => {
            mockUserRepository.findOne.mockResolvedValue({
                twitterUsername: null,
                twitterAccessToken: null
            })

            const result = await service.getTwitterConnectionStatus(1)

            expect(result).toEqual({ connected: false })
        })

        it("should return disconnected status when user not found", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            const result = await service.getTwitterConnectionStatus(999)

            expect(result).toEqual({ connected: false })
        })

        it("should return connected false even if username exists but no token", async () => {
            mockUserRepository.findOne.mockResolvedValue({
                twitterUsername: "olduser",
                twitterAccessToken: null
            })

            const result = await service.getTwitterConnectionStatus(1)

            expect(result.connected).toBe(false)
        })
    })
})
