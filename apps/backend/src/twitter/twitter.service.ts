import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { readFile } from "fs/promises"
import { join } from "path"
import { TwitterApi } from "twitter-api-v2"
import { Repository } from "typeorm"
import { User } from "../auth/entities/user.entity"

interface TwitterUserData {
    id: string;
    username: string;
    verified: boolean;
    verified_type?: string; // 'none' | 'blue' | 'business'
}

interface ScheduleTweetParams {
    text: string;
    scheduledAt: Date;
    mediaIds?: string[];
}

interface ScheduledTweetResponse {
    id: string;
    text: string;
    scheduled_at: string;
}

@Injectable()
export class TwitterService {
    private readonly logger = new Logger(TwitterService.name)
    private twitterClient: TwitterApi | null = null

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService
    ) { }

    /**
   * Renova o access token usando o refresh token
   */
    private async refreshAccessToken(userId: number): Promise<string> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ["twitterRefreshToken"]
        })

        if (!user?.twitterRefreshToken) {
            throw new Error("No refresh token available. Please re-authenticate.")
        }

        try {
            const clientId = this.configService.get<string>("TWITTER_CLIENT_ID")
            const clientSecret = this.configService.get<string>("TWITTER_CLIENT_SECRET")

            // Create an OAuth2 client to refresh the token
            const client = new TwitterApi({
                clientId,
                clientSecret
            })

            // Renovar o access token
            const { accessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token(user.twitterRefreshToken)

            // Salvar os novos tokens
            await this.userRepository.update(userId, {
                twitterAccessToken: accessToken,
                twitterRefreshToken: newRefreshToken || user.twitterRefreshToken
            })

            this.logger.log(`✅ Access token refreshed successfully for user ${userId}`)
            return accessToken
        } catch (error) {
            this.logger.error("Error refreshing access token:", error)
            throw new Error("Failed to refresh access token. Please re-authenticate.")
        }
    }

    /**
   * Inicializa cliente Twitter com tokens do usuário
   */
    private async getClientForUser(userId: number): Promise<TwitterApi> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ["twitterAccessToken", "twitterRefreshToken"]
        })

        if (!user?.twitterAccessToken) {
            throw new Error("User not connected to Twitter. Please authenticate first.")
        }

        return new TwitterApi(user.twitterAccessToken)
    }

    /**
   * Busca dados do usuário autenticado via Twitter API v2
   * Endpoint: GET /2/users/me?user.fields=verified,verified_type
   */
    async fetchAuthenticatedUserData(accessToken: string): Promise<TwitterUserData> {
        try {
            const client = new TwitterApi(accessToken)
            const user = await client.v2.me({
                "user.fields": ["verified", "verified_type"]
            })

            return {
                id: user.data.id,
                username: user.data.username,
                verified: user.data.verified || false,
                verified_type: user.data.verified_type
            }
        } catch (error) {
            this.logger.error("Error fetching authenticated user data from Twitter API:", error)
            throw new Error("Failed to fetch user data from Twitter. Please check your authentication.")
        }
    }

    /**
   * Atualiza o perfil do usuário com dados do Twitter
   * Calcula maxTweetChars baseado no verified_type
   */
    async updateUserTwitterProfile(userId: number, twitterData: TwitterUserData): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new Error("User not found")
        }

        // Determine character limit based on verification type
        let maxTweetChars = 280 // Default

        if (twitterData.verified_type === "blue") {
            maxTweetChars = 25000 // X Premium
        } else if (twitterData.verified_type === "business") {
            maxTweetChars = 4000 // Twitter Business (exemplo)
        }

        user.twitterUsername = twitterData.username
        user.twitterVerifiedType = twitterData.verified_type || "none"
        user.maxTweetChars = maxTweetChars

        return this.userRepository.save(user)
    }

    /**
   * Retorna o limite de caracteres do usuário
   */
    async getUserMaxChars(userId: number): Promise<number> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ["maxTweetChars"]
        })

        return user?.maxTweetChars || 280
    }

    /**
   * Faz upload de arquivos de mídia para o Twitter
   * Retorna array de media_ids para usar no tweet
   */
    async uploadMedia(userId: number, mediaPaths: string[]): Promise<string[]> {
        if (!mediaPaths || mediaPaths.length === 0) {
            return []
        }

        const client = await this.getClientForUser(userId)
        const mediaIds: string[] = []

        for (const mediaPath of mediaPaths) {
            try {
                const fullPath = join(process.cwd(), mediaPath)
                const mediaBuffer = await readFile(fullPath)

                // Upload media to Twitter
                const mediaId = await client.v1.uploadMedia(mediaBuffer, { mimeType: this.getMimeType(mediaPath) })
                mediaIds.push(mediaId)

                this.logger.log(`✅ Media uploaded: ${mediaPath} -> ${mediaId}`)
            } catch (error) {
                this.logger.error(`❌ Failed to upload media ${mediaPath}:`, error)
                throw new Error(`Failed to upload media: ${mediaPath}`)
            }
        }

        return mediaIds
    }

    /**
   * Determina o MIME type baseado na extensão do arquivo
   */
    private getMimeType(filePath: string): string {
        const ext = filePath.split(".").pop()?.toLowerCase()
        const mimeTypes: Record<string, string> = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            webp: "image/webp",
            mp4: "video/mp4",
            mov: "video/quicktime"
        }
        return mimeTypes[ext || ""] || "application/octet-stream"
    }

    /**
   * Posta um tweet imediatamente na API do X
   * Retorna o ID do tweet publicado
   */
    async postTweet(userId: number, params: { text: string; mediaIds?: string[]; mediaPaths?: string[] }): Promise<{ id: string; text: string }> {
        try {
            return await this.attemptPostTweet(userId, params)
        } catch (error: any) {
            // If a 401 (unauthorized) occurs, try to refresh the token and retry
            const errorCode = error?.code || error?.statusCode || error?.status
            if (errorCode === 401 || errorCode === "401") {
                this.logger.log("⚠️ Access token expired (401), attempting to refresh...")
                try {
                    await this.refreshAccessToken(userId)
                    this.logger.log("🔄 Retrying tweet post with new token...")
                    return await this.attemptPostTweet(userId, params)
                } catch (refreshError) {
                    this.logger.error("Failed to refresh token:", refreshError)
                    throw new Error("Authentication failed. Please reconnect your Twitter account.")
                }
            }
            // For other errors, propagate with a meaningful message
            const errorMessage = error?.message || error?.data?.detail || error?.toString()
            throw new Error(`Failed to post tweet: ${errorMessage}`)
        }
    }

    /**
   * Tenta postar um tweet (método auxiliar)
   */
    private async attemptPostTweet(userId: number, params: { text: string; mediaIds?: string[]; mediaPaths?: string[] }): Promise<{ id: string; text: string }> {
        const client = await this.getClientForUser(userId)

        try {
            let mediaIds = params.mediaIds || []

            // If mediaPaths were provided, upload first
            if (params.mediaPaths && params.mediaPaths.length > 0) {
                const uploadedIds = await this.uploadMedia(userId, params.mediaPaths)
                mediaIds = [...mediaIds, ...uploadedIds]
            }

            const tweetData: any = {
                text: params.text
            }

            // Add media if provided
            if (mediaIds.length > 0) {
                tweetData.media = {
                    media_ids: mediaIds
                }
            }

            // Postar tweet imediatamente
            const response = await client.v2.tweet(params.text, tweetData.media ? { media: tweetData.media } : undefined)

            return {
                id: response.data.id,
                text: params.text
            }
        } catch (error) {
            this.logger.error("Error posting tweet:", error)
            throw error
        }
    }

    /**
   * Agenda um tweet (apenas no nosso banco de dados)
   * A API do Twitter v2 não suporta agendamento via API
   * O tweet será postado por um worker/cron quando chegar a hora
   */
    async scheduleTweet(userId: number, params: ScheduleTweetParams): Promise<ScheduledTweetResponse> {
        // Note: The public Twitter v2 API does NOT support scheduled_at
        // This method only validates and returns data to persist in the DB
        // A worker/cron job must call postTweet() when it is time

        const now = new Date()
        const scheduledAt = new Date(params.scheduledAt)

        // Validate that the date is in the future (minimum 5 minutes)
        const minScheduleTime = new Date(now.getTime() + 5 * 60 * 1000)
        if (scheduledAt < minScheduleTime) {
            throw new Error("Scheduled time must be at least 5 minutes in the future")
        }

        // Return mock data - the tweet will be scheduled only in our DB
        return {
            id: `scheduled_${Date.now()}`, // Temporary ID until posted
            text: params.text,
            scheduled_at: scheduledAt.toISOString()
        }
    }

    /**
   * Deleta um tweet (agendado ou já postado) da API do X
   * Retorna true se deletado com sucesso ou se já estava deletado
   * Retorna false apenas se houver erro diferente de "já deletado"
   */
    async deleteTweet(userId: number, tweetId: string): Promise<{ deleted: boolean; alreadyDeleted: boolean }> {
        const client = await this.getClientForUser(userId)

        try {
            await client.v2.deleteTweet(tweetId)

            // Sucesso - tweet deletado
            return { deleted: true, alreadyDeleted: false }
        } catch (error: any) {
            this.logger.error("Error deleting tweet from X:", error)

            // Check if the error is "tweet not found" or "already deleted"
            // The X API returns a 404 or specific message when the tweet does not exist
            const errorMessage = error?.message || error?.toString() || ""
            const errorCode = error?.code || error?.statusCode || error?.status

            // If the tweet was already deleted or does not exist, treat as success
            if (
                errorCode === 404 ||
                errorCode === "404" ||
                errorMessage.includes("not found") ||
                errorMessage.includes("No status found") ||
                errorMessage.includes("does not exist")
            ) {
                this.logger.log(`Tweet ${tweetId} already deleted or not found on X`)
                return { deleted: true, alreadyDeleted: true }
            }

            // For other errors, propagate the exception
            throw new Error(`Failed to delete tweet from X: ${errorMessage}`)
        }
    }

    /**
   * Salva os tokens de acesso do Twitter no banco de dados
   */
    async saveUserTokens(userId: number, accessToken: string, refreshToken?: string): Promise<void> {
        await this.userRepository.update(userId, {
            twitterAccessToken: accessToken,
            twitterRefreshToken: refreshToken
        })
    }

    /**
   * Desconecta a conta do Twitter removendo os tokens
   */
    async disconnectTwitterAccount(userId: number): Promise<void> {
        await this.userRepository.update(userId, {
            twitterAccessToken: null,
            twitterRefreshToken: null,
            twitterUsername: null,
            twitterVerifiedType: null,
            maxTweetChars: 280 // Reset to default
        })
    }

    /**
   * Verifica se o usuário tem conta do Twitter conectada
   */
    async getTwitterConnectionStatus(userId: number): Promise<{
        connected: boolean;
        username?: string;
        verifiedType?: string;
        maxTweetChars?: number;
    }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ["twitterUsername", "twitterVerifiedType", "maxTweetChars", "twitterAccessToken"]
        })

        if (!user || !user.twitterAccessToken) {
            return { connected: false }
        }

        return {
            connected: true,
            username: user.twitterUsername,
            verifiedType: user.twitterVerifiedType,
            maxTweetChars: user.maxTweetChars
        }
    }
}
