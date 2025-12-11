import { ConfigService } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { User } from "../../../src/auth/entities/user.entity"
import { MailerService } from "../../../src/mailer/mailer.service"
import { ScheduledTweet } from "../../../src/scheduled-tweets/entities/scheduled-tweet.entity"

describe("MailerService", () => {
    let service: MailerService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailerService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            const config = {
                                SMTP_HOST: "smtp.mailtrap.io",
                                SMTP_PORT: 2525,
                                SMTP_USER: "test_user",
                                SMTP_PASSWORD: "test_pass",
                                SENDER_EMAIL: "test@example.com"
                            }
                            return config[key]
                        })
                    }
                }
            ]
        }).compile()

        service = module.get<MailerService>(MailerService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("sendTweetPostedNotification", () => {
        it("should handle missing transporter gracefully", async () => {
            const user: Partial<User> = {
                id: 1,
                email: "test@example.com",
                twitterUsername: "testuser"
            }

            const tweet: Partial<ScheduledTweet> = {
                id: 1,
                text: "Test tweet",
                tweetId: "tweet123",
                scheduledFor: new Date(),
                status: "posted" as any
            }

            // Mock transporter as undefined
            service["transporter"] = undefined

            // Should not throw
            await expect(
                service.sendTweetPostedNotification(
                    user as User,
                    tweet as ScheduledTweet
                )
            ).resolves.not.toThrow()
        })
    })

    describe("sendTweetFailedNotification", () => {
        it("should handle missing transporter gracefully", async () => {
            const user: Partial<User> = {
                id: 1,
                email: "test@example.com"
            }

            const tweet: Partial<ScheduledTweet> = {
                id: 1,
                text: "Test tweet",
                status: "failed" as any,
                errorMessage: "Test error"
            }

            // Mock transporter as undefined
            service["transporter"] = undefined

            // Should not throw
            await expect(
                service.sendTweetFailedNotification(
                    user as User,
                    tweet as ScheduledTweet
                )
            ).resolves.not.toThrow()
        })
    })
})
