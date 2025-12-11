import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { LessThanOrEqual, Repository } from "typeorm"
import { User } from "../auth/entities/user.entity"
import { MailerService } from "../mailer/mailer.service"
import { MediaService } from "../media/media.service"
import { ScheduledTweet } from "../scheduled-tweets/entities/scheduled-tweet.entity"
import { TwitterService } from "../twitter/twitter.service"

@Injectable()
export class TweetSchedulerService {
    private readonly logger = new Logger(TweetSchedulerService.name)

    constructor(
        @InjectRepository(ScheduledTweet)
        private readonly scheduledTweetsRepository: Repository<ScheduledTweet>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly twitterService: TwitterService,
        private readonly mediaService: MediaService,
        private readonly mailerService: MailerService
    ) { }

    /**
     * Runs every minute to check tweets ready to be posted
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async processPendingTweets() {
        const now = new Date()

        this.logger.debug(`[${now.toISOString()}] Checking for tweets to post...`)

        try {
            // Find all tweets with status 'scheduled' whose scheduled time has passed
            const tweetsToPost = await this.scheduledTweetsRepository.find({
                where: {
                    status: "scheduled",
                    scheduledFor: LessThanOrEqual(now)
                },
                order: {
                    scheduledFor: "ASC"
                }
            })

            if (tweetsToPost.length === 0) {
                this.logger.debug("No tweets to post at this time.")
                return
            }

            this.logger.log(`Found ${tweetsToPost.length} tweet(s) ready to post.`)

            // Process each tweet
            for (const tweet of tweetsToPost) {
                await this.postTweet(tweet)
            }
        } catch (error) {
            this.logger.error("Error processing pending tweets:", error)
        }
    }

    /**
     * Posts an individual tweet and updates its status
     */
    private async postTweet(tweet: ScheduledTweet): Promise<void> {
        this.logger.log(
            `Posting tweet ID ${tweet.id}: "${tweet.text.substring(0, 50)}..."`
        )

        try {
            // Call the Twitter API to post (mediaPaths will be used for upload)
            const response = await this.twitterService.postTweet(tweet.userId, {
                text: tweet.text,
                mediaIds: tweet.mediaIds,
                mediaPaths:
                    tweet.mediaIds && tweet.mediaIds.length > 0
                        ? undefined
                        : tweet.mediaPaths
            })

            // Update status to 'posted' and save tweetId
            tweet.status = "posted"
            tweet.tweetId = response.id
            tweet.errorMessage = null
            await this.scheduledTweetsRepository.save(tweet)

            this.logger.log(
                `✅ Tweet ID ${tweet.id} posted successfully. Twitter ID: ${response.id}`
            )

            // Send success notification via email
            try {
                const user = await this.usersRepository.findOne({
                    where: { id: tweet.userId }
                })
                if (user) {
                    await this.mailerService.sendTweetPostedNotification(user, tweet)
                }
            } catch (emailError) {
                this.logger.warn(
                    `Failed to send success notification email for tweet ${tweet.id}:`,
                    emailError.message
                )
            }

            // CLEANUP: Delete media files from the server after success
            if (tweet.mediaPaths && tweet.mediaPaths.length > 0) {
                this.logger.log(
                    `🗑️ Cleaning up ${tweet.mediaPaths.length} media file(s) for tweet ${tweet.id}...`
                )

                for (const mediaPath of tweet.mediaPaths) {
                    try {
                        // Extract only the filename from the path (e.g., "uploads/file.jpg" -> "file.jpg")
                        const filename = mediaPath.split("/").pop()
                        if (filename) {
                            await this.mediaService.deleteFile(filename)
                            this.logger.debug(`✅ Deleted: ${filename}`)
                        }
                    } catch (cleanupError) {
                        this.logger.warn(
                            `Failed to delete media file ${mediaPath}:`,
                            cleanupError.message
                        )
                        // Do not fail the tweet due to cleanup error
                    }
                }

                this.logger.log(`✅ Media cleanup completed for tweet ${tweet.id}`)
            }
        } catch (error) {
            // On error, mark as 'failed' and save the error message
            this.logger.error(
                `❌ Failed to post tweet ID ${tweet.id}:`,
                error.message
            )

            tweet.status = "failed"
            tweet.errorMessage = error.message
            await this.scheduledTweetsRepository.save(tweet)

            // Send error notification via email
            try {
                const user = await this.usersRepository.findOne({
                    where: { id: tweet.userId }
                })
                if (user) {
                    await this.mailerService.sendTweetFailedNotification(user, tweet)
                }
            } catch (emailError) {
                this.logger.warn(
                    `Failed to send error notification email for tweet ${tweet.id}:`,
                    emailError.message
                )
            }
        }
    }

    /**
     * Helper method to trigger manual processing (useful for tests)
     */
    async processNow(): Promise<void> {
        this.logger.log("Manual processing triggered...")
        await this.processPendingTweets()
    }
}
