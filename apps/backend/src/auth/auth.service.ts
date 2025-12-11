import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { Repository } from "typeorm"
import { AuthResponseDto } from "./dto/auth-response.dto"
import { UserProfileDto } from "./dto/user-profile.dto"
import { User } from "./entities/user.entity"
import { InvalidTokenException, UserNotFoundException } from "./exceptions"

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { email } })
        if (user && (await bcrypt.compare(password, user.password))) {
            const { ...result } = user
            return result
        }
        return null
    }

    async login(user: any): Promise<AuthResponseDto> {
        const payload = { email: user.email, sub: user.id }
        const accessToken = this.jwtService.sign(payload)

        // Use jsonwebtoken directly for refresh token
        const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET") || "refresh_secret"
        const refreshToken = jwt.sign(
            payload,
            refreshSecret,
            { expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN") || "30d" } as jwt.SignOptions
        )

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email
            }
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
        try {
            const refreshSecret = this.configService.get<string>("JWT_REFRESH_SECRET") || "refresh_secret"
            const payload = jwt.verify(refreshToken, refreshSecret) as any

            const user = await this.userRepository.findOne({
                where: { id: payload.sub }
            })

            if (!user) {
                throw new UserNotFoundException(`id: ${payload.sub}`)
            }

            return this.login(user)
        } catch (error) {
            if (error instanceof UserNotFoundException) {
                throw error
            }
            throw new InvalidTokenException("Invalid or expired refresh token")
        }
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10)
    }

    async createUser(email: string, password: string): Promise<User> {
        const hashedPassword = await this.hashPassword(password)
        const user = this.userRepository.create({
            email,
            password: hashedPassword
        })
        return this.userRepository.save(user)
    }

    async getUserProfile(userId: number): Promise<UserProfileDto> {
        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new UserNotFoundException(`id: ${userId}`)
        }

        const { ...profile } = user
        return profile as UserProfileDto
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new UserNotFoundException(`id: ${userId}`)
        }

        // Check if the current password is correct
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isCurrentPasswordValid) {
            throw new Error("Senha atual incorreta")
        }

        // Hash the new password
        const hashedNewPassword = await this.hashPassword(newPassword)

        // Update password in the database
        await this.userRepository.update(userId, { password: hashedNewPassword })

        return { message: "Senha alterada com sucesso" }
    }

    async updateTimezone(userId: number, timezone: string): Promise<{ timezone: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new UserNotFoundException(`id: ${userId}`)
        }

        // Update timezone in the database
        await this.userRepository.update(userId, { timezone })

        return { timezone }
    }
}
