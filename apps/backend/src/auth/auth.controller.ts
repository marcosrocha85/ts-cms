import { Body, Controller, Get, Patch, Post, Request, UseGuards } from "@nestjs/common"
import { TimezoneService } from "../common/timezone.service"
import { AuthService } from "./auth.service"
import { AuthResponseDto } from "./dto/auth-response.dto"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { RefreshTokenDto } from "./dto/refresh-token.dto"
import { UpdateTimezoneDto } from "./dto/update-timezone.dto"
import { UserProfileDto } from "./dto/user-profile.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { LocalAuthGuard } from "./guards/local-auth.guard"

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private timezoneService: TimezoneService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post("login")
    async login(@Request() req): Promise<AuthResponseDto> {
        return this.authService.login(req.user)
    }

    @Post("refresh")
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
        return this.authService.refreshToken(refreshTokenDto.refreshToken)
    }

    @UseGuards(JwtAuthGuard)
    @Get("profile")
    async getProfile(@Request() req): Promise<UserProfileDto> {
        return this.authService.getUserProfile(req.user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Post("logout")
    async logout(): Promise<{ message: string }> {
        // For now, simply return success
        // In production, you can add a token blacklist in Redis
        // @Request() req
        return { message: "Logout successful" }
    }

    @UseGuards(JwtAuthGuard)
    @Patch("change-password")
    async changePassword(
        @Request() req,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<{ message: string }> {
        const { currentPassword, newPassword, confirmPassword } = changePasswordDto

        // Validate that new password and confirmation match
        if (newPassword !== confirmPassword) {
            throw new Error("Nova senha e confirmação não conferem")
        }

        return this.authService.changePassword(req.user.id, currentPassword, newPassword)
    }

    @UseGuards(JwtAuthGuard)
    @Patch("timezone")
    async updateTimezone(
        @Request() req,
        @Body() updateTimezoneDto: UpdateTimezoneDto
    ): Promise<{ timezone: string }> {
        const { timezone } = updateTimezoneDto

        // Validate that the timezone is valid
        if (!this.timezoneService.isValidTimezone(timezone)) {
            throw new Error(`Timezone inválido: ${timezone}`)
        }

        return this.authService.updateTimezone(req.user.id, timezone)
    }

    @UseGuards(JwtAuthGuard)
    @Get("timezones")
    getAllTimezones(): string[] {
        return this.timezoneService.getAllTimezones()
    }

    @UseGuards(JwtAuthGuard)
    @Get("timezones/:region")
    getTimezonesByRegion(@Request() req): any {
        const region = req.params.region
        return this.timezoneService.getTimezonesByRegion(region)
    }
}
