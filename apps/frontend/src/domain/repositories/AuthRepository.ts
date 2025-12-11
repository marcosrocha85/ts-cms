import type { User } from "../entities/User"

export interface LoginResponse {
    user: User
    accessToken: string
    refreshToken: string
}

export interface AuthRepository {
    login(email: string, password: string): Promise<LoginResponse>
    refreshToken(refreshToken: string): Promise<{ accessToken: string }>
    changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }>
    logout(): void
}
