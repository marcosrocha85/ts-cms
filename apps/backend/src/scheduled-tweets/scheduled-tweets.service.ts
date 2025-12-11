import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { MediaService } from "../media/media.service"
import { TwitterService } from "../twitter/twitter.service"
import { CreateScheduledTweetDto } from "./dto/create-scheduled-tweet.dto"
import { ScheduledTweetResponseDto } from "./dto/scheduled-tweet-response.dto"
import { UpdateScheduledTweetDto } from "./dto/update-scheduled-tweet.dto"
import { ScheduledTweet, TweetStatus } from "./entities/scheduled-tweet.entity"

@Injectable()
export class ScheduledTweetsService {
    private readonly logger = new Logger(ScheduledTweetsService.name)

    constructor(
        @InjectRepository(ScheduledTweet)
        private scheduledTweetsRepository: Repository<ScheduledTweet>,
        private twitterService: TwitterService,
        private mediaService: MediaService
    ) { }

    async create(
        createDto: CreateScheduledTweetDto,
        userId: number
    ): Promise<ScheduledTweetResponseDto> {
        const scheduledFor = new Date(createDto.scheduledFor)
        const now = new Date()

        // Create the entity in the database first
        const scheduledTweet = this.scheduledTweetsRepository.create({
            ...createDto,
            userId,
            scheduledFor,
            status: createDto.status || "draft"
        })

        // If media exists, upload NOW and save mediaIds
        if (scheduledTweet.mediaPaths && scheduledTweet.mediaPaths.length > 0) {
            try {
                const mediaIds = await this.twitterService.uploadMedia(
                    userId,
                    scheduledTweet.mediaPaths
                )
                scheduledTweet.mediaIds = mediaIds
            } catch (error) {
                scheduledTweet.status = "failed"
                scheduledTweet.errorMessage = error.message
            }
        }

        const saved = await this.scheduledTweetsRepository.save(scheduledTweet)

        // If status is 'scheduled', only validate (scheduling will be handled by worker/cron)
        if (saved.status === "scheduled") {
            try {
                // Validate that the date is in the future (minimum 5 minutes)
                const minScheduleTime = new Date(now.getTime() + 5 * 60 * 1000)
                if (scheduledFor < minScheduleTime) {
                    throw new Error(
                        "Scheduled time must be at least 5 minutes in the future"
                    )
                }

                const twitterResponse = await this.twitterService.scheduleTweet(
                    userId,
                    {
                        text: saved.text,
                        scheduledAt: saved.scheduledFor,
                        mediaIds: saved.mediaIds
                    }
                )

                // Save the temporary ID (will be replaced when the tweet is posted)
                saved.tweetId = twitterResponse.id
                await this.scheduledTweetsRepository.save(saved)
            } catch (error) {
                // If validation fails, mark as failed
                saved.status = "failed"
                saved.errorMessage = error.message
                await this.scheduledTweetsRepository.save(saved)
                throw new BadRequestException(
                    `Failed to schedule tweet: ${error.message}`
                )
            }
        }

        // If the date is too close (< 5 min) OR status is 'posted', post immediately
        const minScheduleTime = new Date(now.getTime() + 5 * 60 * 1000)
        if (scheduledFor < minScheduleTime || saved.status === "posted") {
            try {
                const twitterResponse = await this.twitterService.postTweet(userId, {
                    text: saved.text,
                    mediaIds: saved.mediaIds,
                    mediaPaths:
                        saved.mediaIds && saved.mediaIds.length > 0
                            ? undefined
                            : saved.mediaPaths
                })

                // Update with the real posted tweet ID
                saved.tweetId = twitterResponse.id
                saved.status = "posted"
                await this.scheduledTweetsRepository.save(saved)
            } catch (error) {
                // If posting fails, mark as failed
                saved.status = "failed"
                saved.errorMessage = error.message
                await this.scheduledTweetsRepository.save(saved)
                throw new BadRequestException(`Failed to post tweet: ${error.message}`)
            }
        }

        return new ScheduledTweetResponseDto(saved)
    }

    async findAll(
        userId: number,
        query: {
            status?: TweetStatus
            search?: string
            page?: number
            limit?: number
            dateFrom?: string
            dateTo?: string
        }
    ): Promise<{
        data: ScheduledTweetResponseDto[]
        meta: {
            total: number
            page: number
            limit: number
            totalPages: number
        }
    }> {
        const { status, search, page = 1, limit = 10, dateFrom, dateTo } = query
        const skip = (page - 1) * limit

        const queryBuilder = this.scheduledTweetsRepository
            .createQueryBuilder("tweet")
            .where("tweet.userId = :userId", { userId })
            .orderBy("tweet.scheduledFor", "ASC")
            .skip(skip)
            .take(limit)

        if (status) {
            queryBuilder.andWhere("tweet.status = :status", { status })
        }

        if (search) {
            queryBuilder.andWhere("tweet.text LIKE :search", { search: `%${search}%` })
        }

        if (dateFrom) {
            queryBuilder.andWhere("tweet.scheduledFor >= :dateFrom", { dateFrom })
        }

        if (dateTo) {
            queryBuilder.andWhere("tweet.scheduledFor <= :dateTo", { dateTo })
        }

        const [tweets, total] = await queryBuilder.getManyAndCount()

        return {
            data: tweets.map((tweet) => new ScheduledTweetResponseDto(tweet)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    }

    async findOne(
        id: number,
        userId: number
    ): Promise<ScheduledTweetResponseDto> {
        const tweet = await this.scheduledTweetsRepository.findOne({
            where: { id, userId }
        })

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${id} not found`)
        }

        return new ScheduledTweetResponseDto(tweet)
    }

    async update(
        id: number,
        updateDto: UpdateScheduledTweetDto,
        userId: number
    ): Promise<ScheduledTweetResponseDto> {
        const tweet = await this.scheduledTweetsRepository.findOne({
            where: { id, userId }
        })

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${id} not found`)
        }

        // Do not allow editing tweets that are already posted
        if (tweet.status === "posted") {
            throw new ForbiddenException(
                "Cannot edit a tweet that has already been posted"
            )
        }

        // Check if rescheduling is needed on Twitter
        const needsRescheduling =
            tweet.status === "scheduled" &&
            tweet.tweetId &&
            (updateDto.text || updateDto.scheduledFor || updateDto.mediaPaths)

        // If needs rescheduling, delete the old scheduled tweet
        if (needsRescheduling) {
            try {
                await this.twitterService.deleteTweet(userId, tweet.tweetId)
            } catch (error) {
                if (process.env.NODE_ENV !== "test") {
                    this.logger.error(
                        "Failed to delete tweet from X during update:",
                        error.message
                    )
                }
            }
        }

        // Update fields
        const updateData: Partial<ScheduledTweet> = {}

        if (updateDto.text) {
            updateData.text = updateDto.text
        }
        if (updateDto.mediaPaths) {
            updateData.mediaPaths = updateDto.mediaPaths
        }

        // If mediaPaths changed, re-upload and update mediaIds
        if (updateDto.mediaPaths && updateDto.mediaPaths.length > 0) {
            try {
                const mediaIds = await this.twitterService.uploadMedia(
                    userId,
                    updateDto.mediaPaths
                )
                updateData.mediaIds = mediaIds
            } catch (error) {
                updateData.status = "failed"
                updateData.errorMessage = error.message
            }
        }

        // Process status first (if explicitly sent)
        if (updateDto.status !== undefined) {
            updateData.status = updateDto.status
        }

        // Process scheduledFor and apply auto-recovery logic
        if (updateDto.scheduledFor) {
            updateData.scheduledFor = new Date(updateDto.scheduledFor)

            // If the scheduled date moved to the future and tweet was failed, change to scheduled
            const newScheduledFor = new Date(updateDto.scheduledFor)
            const now = new Date()

            // Only change automatically if status was NOT sent explicitly AND tweet is failed AND date is in the future
            if (
                updateDto.status === undefined &&
                tweet.status === "failed" &&
                newScheduledFor > now
            ) {
                updateData.status = "scheduled"
                updateData.errorMessage = null // Clear error message
            }
        }

        Object.assign(tweet, updateData)

        // If switched to 'scheduled', schedule on Twitter again
        if (tweet.status === "scheduled" && (needsRescheduling || !tweet.tweetId)) {
            try {
                const twitterResponse = await this.twitterService.scheduleTweet(
                    userId,
                    {
                        text: tweet.text,
                        scheduledAt: tweet.scheduledFor,
                        mediaIds: tweet.mediaIds
                    }
                )

                tweet.tweetId = twitterResponse.id
                tweet.errorMessage = null // Clear previous error if any
            } catch (error) {
                tweet.status = "failed"
                tweet.errorMessage = error.message
                throw new BadRequestException(
                    `Failed to schedule tweet on Twitter: ${error.message}`
                )
            }
        }

        const saved = await this.scheduledTweetsRepository.save(tweet)
        return new ScheduledTweetResponseDto(saved)
    }

    async remove(id: number, userId: number): Promise<void> {
        const tweet = await this.scheduledTweetsRepository.findOne({
            where: { id, userId }
        })

        if (!tweet) {
            throw new NotFoundException(`Tweet with ID ${id} not found`)
        }

        // If the tweet has tweetId (posted or scheduled on X API), try deleting it there
        if (tweet.tweetId) {
            try {
                const result = await this.twitterService.deleteTweet(
                    userId,
                    tweet.tweetId
                )

                if (result.deleted) {
                    this.logger.log(
                        result.alreadyDeleted
                            ? `Tweet ${tweet.tweetId} already deleted from X, removing from database`
                            : `Tweet ${tweet.tweetId} deleted from X successfully`
                    )
                }
            } catch (error) {
                if (process.env.NODE_ENV !== "test") {
                    this.logger.error("Failed to delete tweet from X:", error.message)
                }
            }
        }

        // CLEANUP: Delete associated media files (if not posted, the files still exist)
        if (
            tweet.mediaPaths &&
            tweet.mediaPaths.length > 0 &&
            tweet.status !== "posted"
        ) {
            this.logger.log(
                `🗑️ Cleaning up ${tweet.mediaPaths.length} media file(s) for tweet ${tweet.id}...`
            )

            for (const mediaPath of tweet.mediaPaths) {
                try {
                    const filename = mediaPath.split("/").pop()
                    if (filename) {
                        await this.mediaService.deleteFile(filename)
                        this.logger.log(`✅ Deleted: ${filename}`)
                    }
                } catch (cleanupError) {
                    this.logger.warn(
                        `Failed to delete media file ${mediaPath}:`,
                        cleanupError.message
                    )
                    // Do not fail removal due to cleanup errors
                }
            }
        }

        // Hard delete do banco de dados
        await this.scheduledTweetsRepository.remove(tweet)
    }

    async getStats(userId: number): Promise<{
        total: number;
        scheduled: number;
        posted: number;
        failed: number;
        draft: number;
    }> {
        const [total, scheduled, posted, failed, draft] = await Promise.all([
            this.scheduledTweetsRepository.count({ where: { userId } }),
            this.scheduledTweetsRepository.count({
                where: { userId, status: "scheduled" }
            }),
            this.scheduledTweetsRepository.count({
                where: { userId, status: "posted" }
            }),
            this.scheduledTweetsRepository.count({
                where: { userId, status: "failed" }
            }),
            this.scheduledTweetsRepository.count({
                where: { userId, status: "draft" }
            })
        ])

        return { total, scheduled, posted, failed, draft }
    }
}
