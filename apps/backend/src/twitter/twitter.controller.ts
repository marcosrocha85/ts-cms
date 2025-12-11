import { Controller, Get, HttpStatus, Logger, Query, Req, Res, UseGuards } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { Response } from "express"
import { TwitterApi } from "twitter-api-v2"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { TwitterService } from "./twitter.service"

@Controller("twitter")
export class TwitterController {
    private readonly logger = new Logger(TwitterController.name)
    private twitterOAuthClient: TwitterApi

    constructor(
        private readonly twitterService: TwitterService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {
        // Initialize OAuth client with Client ID and Client Secret
        const clientId = this.configService.get<string>("TWITTER_CLIENT_ID")
        const clientSecret = this.configService.get<string>("TWITTER_CLIENT_SECRET")

        if (clientId && clientSecret) {
            this.twitterOAuthClient = new TwitterApi({
                clientId,
                clientSecret
            })
        }
    }

    /**
     * Starts the Twitter OAuth 2.0 flow
     * Redirects the user to Twitter authorization
     * Accepts token via query param (access_token) because this is a browser redirect
     */
    @Get("auth")
    async initiateOAuth(
        @Query("access_token") accessToken: string,
        @Res() res: Response
    ) {
        if (!this.twitterOAuthClient) {
            return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
                message: "Twitter OAuth not configured. Please set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET"
            })
        }

        // Manually validate the JWT token (cannot use Guard with redirects)
        if (!accessToken) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: "Access token is required"
            })
        }

        let userId: number
        try {
            const payload = this.jwtService.verify(accessToken, {
                secret: this.configService.get<string>("JWT_SECRET")
            })
            userId = payload.sub
        } catch (error) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                message: "Invalid or expired token"
            })
        }

        try {
            const callbackUrl = this.configService.get<string>("TWITTER_CALLBACK_URL") ||
                "http://localhost:3000/api/twitter/callback"

            // Generate OAuth 2.0 authorization link
            const { url, codeVerifier, state } = this.twitterOAuthClient.generateOAuth2AuthLink(
                callbackUrl,
                {
                    scope: [
                        "tweet.read",
                        "tweet.write",
                        "users.read",
                        "offline.access" // For refresh token
                    ]
                }
            )

            // Save encoded codeVerifier and state
            const encodedState = Buffer.from(JSON.stringify({
                userId,
                codeVerifier,
                state
            })).toString("base64")

            // Redirect to Twitter with custom state
            const authUrl = new URL(url)
            authUrl.searchParams.set("state", encodedState)

            return res.redirect(authUrl.toString())
        } catch (error) {
            this.logger.error("Error initiating OAuth:", error)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: "Failed to initiate Twitter authentication",
                error: error.message
            })
        }
    }

    /**
     * Twitter OAuth 2.0 callback
     * Receives the authorization code and exchanges it for an access token
     */
    @Get("callback")
    async handleOAuthCallback(
        @Query("code") code: string,
        @Query("state") state: string,
        @Res() res: Response
    ) {
        if (!code || !state) {
            return res.redirect(`${this.getFrontendUrl()}/profile?error=oauth_failed`)
        }

        try {
            // Decode state to recover userId and codeVerifier
            const decodedState = JSON.parse(Buffer.from(state, "base64").toString())
            const { userId, codeVerifier } = decodedState

            const callbackUrl = this.configService.get<string>("TWITTER_CALLBACK_URL") ||
                "http://localhost:3000/api/twitter/callback"

            // Exchange code for access token
            const { client, accessToken, refreshToken } = await this.twitterOAuthClient.loginWithOAuth2({
                code,
                codeVerifier,
                redirectUri: callbackUrl
            })

            // Fetch data for the authenticated user
            const { data: twitterUser } = await client.v2.me({
                "user.fields": ["verified_type", "verified"]
            })

            // Save tokens to the database
            await this.twitterService.updateUserTwitterProfile(userId, {
                id: twitterUser.id,
                username: twitterUser.username,
                verified: twitterUser.verified || false,
                verified_type: twitterUser.verified_type
            })

            // Persist tokens (handled via TwitterService)
            await this.twitterService.saveUserTokens(userId, accessToken, refreshToken)

            // Redirect to frontend on success
            return res.redirect(`${this.getFrontendUrl()}/profile?twitter_connected=true`)
        } catch (error) {
            this.logger.error("Error handling OAuth callback:", error)
            return res.redirect(`${this.getFrontendUrl()}/profile?error=oauth_failed`)
        }
    }

    /**
     * Disconnect Twitter account
     */
    @UseGuards(JwtAuthGuard)
    @Get("disconnect")
    async disconnectTwitter(@Req() req: any) {
        await this.twitterService.disconnectTwitterAccount(req.user.id)
        return { message: "Twitter account disconnected successfully" }
    }

    /**
     * Check whether the user has a connected account
     */
    @UseGuards(JwtAuthGuard)
    @Get("status")
    async getTwitterStatus(@Req() req: any) {
        const status = await this.twitterService.getTwitterConnectionStatus(req.user.id)
        return status
    }

    private getFrontendUrl(): string {
        return this.configService.get<string>("FRONTEND_URL") || "http://localhost:3001"
    }
}
