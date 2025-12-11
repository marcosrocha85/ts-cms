import type { AuthRepository as IAuthRepository, LoginResponse } from "../../domain/repositories/AuthRepository"
import type { ApiDataSource } from "../datasources/ApiDataSource"

export class AuthRepository implements IAuthRepository {
    constructor(private apiDataSource: ApiDataSource) {}

    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await this.apiDataSource.post<LoginResponse>("/auth/login", { email, password })

        const { accessToken, refreshToken } = response.data
        if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", accessToken)
            localStorage.setItem("refreshToken", refreshToken)
        }

        return response.data
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const response = await this.apiDataSource.post<{ accessToken: string }>("/auth/refresh", { refreshToken })

        if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", response.data.accessToken)
        }

        return response.data
    }

    async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
        const response = await this.apiDataSource.patch<{ message: string }>("/auth/change-password", {
            currentPassword,
            newPassword,
            confirmPassword
        })

        return response.data
    }

    logout(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
        }
    }
}
