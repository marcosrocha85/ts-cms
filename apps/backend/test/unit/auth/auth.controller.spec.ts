import { Test, TestingModule } from "@nestjs/testing"
import { AuthController } from "../../../src/auth/auth.controller"
import { AuthService } from "../../../src/auth/auth.service"
import { AuthResponseDto } from "../../../src/auth/dto/auth-response.dto"
import { RefreshTokenDto } from "../../../src/auth/dto/refresh-token.dto"
import { ChangePasswordDto } from "../../../src/auth/dto/change-password.dto"

describe("AuthController", () => {
    let controller: AuthController

    const mockAuthService = {
        login: jest.fn(),
        refreshToken: jest.fn(),
        getUserProfile: jest.fn(),
        changePassword: jest.fn()
    }

    const mockUser = {
        id: 1,
        email: "test@example.com"
    }

    const mockAuthResponse: AuthResponseDto = {
        accessToken: "access.token",
        refreshToken: "refresh.token",
        user: mockUser
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService
                }
            ]
        }).compile()

        controller = module.get<AuthController>(AuthController)

        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })

    describe("login", () => {
        it("should return auth tokens on successful login", async () => {
            mockAuthService.login.mockResolvedValue(mockAuthResponse)

            const req = { user: mockUser }
            const result = await controller.login(req)

            expect(result).toEqual(mockAuthResponse)
            expect(mockAuthService.login).toHaveBeenCalledWith(mockUser)
        })
    })

    describe("refresh", () => {
        it("should return new auth tokens", async () => {
            const refreshTokenDto: RefreshTokenDto = {
                refreshToken: "valid.refresh.token"
            }
            mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse)

            const result = await controller.refresh(refreshTokenDto)

            expect(result).toEqual(mockAuthResponse)
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken)
        })
    })

    describe("getProfile", () => {
        it("should return user profile", async () => {
            const userProfile = {
                id: 1,
                email: "test@example.com",
                createdAt: new Date()
            }
            mockAuthService.getUserProfile.mockResolvedValue(userProfile)

            const req = { user: { id: 1 } }
            const result = await controller.getProfile(req)

            expect(result).toEqual(userProfile)
            expect(mockAuthService.getUserProfile).toHaveBeenCalledWith(1)
        })
    })

    describe("logout", () => {
        it("should return success message", async () => {
            const result = await controller.logout()

            expect(result).toEqual({ message: "Logout successful" })
        })
    })

    describe("changePassword", () => {
        it("should change password successfully", async () => {
            const changePasswordDto: ChangePasswordDto = {
                currentPassword: "oldpassword",
                newPassword: "newpassword123",
                confirmPassword: "newpassword123"
            }
            mockAuthService.changePassword.mockResolvedValue({
                message: "Password changed successfully"
            })

            const req = { user: { id: 1 } }
            const result = await controller.changePassword(req, changePasswordDto)

            expect(result).toEqual({ message: "Password changed successfully" })
            expect(mockAuthService.changePassword).toHaveBeenCalledWith(
                1,
                changePasswordDto.currentPassword,
                changePasswordDto.newPassword
            )
        })

        it("should throw error when passwords don't match", async () => {
            const changePasswordDto: ChangePasswordDto = {
                currentPassword: "oldpassword",
                newPassword: "newpassword123",
                confirmPassword: "differentpassword"
            }

            const req = { user: { id: 1 } }

            await expect(controller.changePassword(req, changePasswordDto)).rejects.toThrow(
                "Nova senha e confirmação não conferem"
            )
        })
    })
})
