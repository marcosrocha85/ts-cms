import { Test, TestingModule } from "@nestjs/testing"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { getRepositoryToken } from "@nestjs/typeorm"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"
import { AuthService } from "../../../src/auth/auth.service"
import { User } from "../../../src/auth/entities/user.entity"
import { InvalidTokenException, UserNotFoundException } from "../../../src/auth/exceptions"

describe("AuthService", () => {
    let service: AuthService

    const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "$2b$10$hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn()
    }

    const mockJwtService = {
        sign: jest.fn()
    }

    const mockConfigService = {
        get: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                }
            ]
        }).compile()

        service = module.get<AuthService>(AuthService)

        // Reset mocks
        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("validateUser", () => {
        it("should return user data when credentials are valid", async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser)
            jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true))

            const result = await service.validateUser("test@example.com", "password")

            expect(result).toBeDefined()
            expect(result.email).toBe(mockUser.email)
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { email: "test@example.com" }
            })
        })

        it("should return null when user not found", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            const result = await service.validateUser("test@example.com", "password")

            expect(result).toBeNull()
        })

        it("should return null when password is invalid", async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser)
            jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false))

            const result = await service.validateUser("test@example.com", "wrongpassword")

            expect(result).toBeNull()
        })
    })

    describe("login", () => {
        it("should return access and refresh tokens", async () => {
            const accessToken = "access.token.here"
            const refreshToken = "refresh.token.here"

            mockJwtService.sign.mockReturnValue(accessToken)
            mockConfigService.get
                .mockReturnValueOnce("refresh_secret")
                .mockReturnValueOnce("30d")

            jest.spyOn(jwt, "sign").mockReturnValue(refreshToken as any)

            const result = await service.login(mockUser)

            expect(result).toEqual({
                accessToken,
                refreshToken,
                user: {
                    id: mockUser.id,
                    email: mockUser.email
                }
            })
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                email: mockUser.email,
                sub: mockUser.id
            })
        })
    })

    describe("refreshToken", () => {
        it("should return new tokens when refresh token is valid", async () => {
            const refreshToken = "valid.refresh.token"
            const payload = { email: mockUser.email, sub: mockUser.id }

            mockConfigService.get.mockReturnValue("refresh_secret")
            jest.spyOn(jwt, "verify").mockReturnValue(payload as any)
            mockUserRepository.findOne.mockResolvedValue(mockUser)
            mockJwtService.sign.mockReturnValue("new.access.token")
            jest.spyOn(jwt, "sign").mockReturnValue("new.refresh.token" as any)

            const result = await service.refreshToken(refreshToken)

            expect(result).toBeDefined()
            expect(result.accessToken).toBe("new.access.token")
            expect(jwt.verify).toHaveBeenCalledWith(refreshToken, "refresh_secret")
        })

        it("should throw InvalidTokenException when token is invalid", async () => {
            const refreshToken = "invalid.refresh.token"

            mockConfigService.get.mockReturnValue("refresh_secret")
            jest.spyOn(jwt, "verify").mockImplementation(() => {
                throw new Error("Invalid token")
            })

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(InvalidTokenException)
        })

        it("should throw UserNotFoundException when user not found", async () => {
            const refreshToken = "valid.refresh.token"
            const payload = { email: mockUser.email, sub: mockUser.id }

            mockConfigService.get.mockReturnValue("refresh_secret")
            jest.spyOn(jwt, "verify").mockReturnValue(payload as any)
            mockUserRepository.findOne.mockResolvedValue(null)

            await expect(service.refreshToken(refreshToken)).rejects.toThrow(UserNotFoundException)
        })
    })

    describe("hashPassword", () => {
        it("should hash password", async () => {
            const password = "plaintext"
            jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve("hashed" as any))

            const result = await service.hashPassword(password)

            expect(result).toBe("hashed")
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10)
        })
    })

    describe("createUser", () => {
        it("should create and save user with hashed password", async () => {
            const email = "new@example.com"
            const password = "password123"
            const hashedPassword = "hashed.password"

            jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve(hashedPassword as any))
            mockUserRepository.create.mockReturnValue({ email, password: hashedPassword })
            mockUserRepository.save.mockResolvedValue({ id: 1, email, password: hashedPassword })

            const result = await service.createUser(email, password)

            expect(result).toBeDefined()
            expect(result.email).toBe(email)
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email,
                password: hashedPassword
            })
            expect(mockUserRepository.save).toHaveBeenCalled()
        })
    })

    describe("getUserProfile", () => {
        it("should return user profile", async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser)

            const result = await service.getUserProfile(mockUser.id)

            expect(result).toBeDefined()
            expect(result.email).toBe(mockUser.email)
        })

        it("should throw UserNotFoundException when user not found", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            await expect(service.getUserProfile(999)).rejects.toThrow(UserNotFoundException)
        })
    })

    describe("changePassword", () => {
        it("should change password when current password is correct", async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser)
            jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true))
            jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve("new.hashed.password" as any))
            mockUserRepository.save.mockResolvedValue({ ...mockUser, password: "new.hashed.password" })

            const result = await service.changePassword(mockUser.id, "oldpassword", "newpassword")

            expect(result).toEqual({ message: "Senha alterada com sucesso" })
            expect(bcrypt.compare).toHaveBeenCalledWith("oldpassword", mockUser.password)
            expect(mockUserRepository.update).toHaveBeenCalled()
        })

        it("should throw error when user not found", async () => {
            mockUserRepository.findOne.mockResolvedValue(null)

            await expect(
                service.changePassword(999, "oldpassword", "newpassword")
            ).rejects.toThrow(UserNotFoundException)
        })

        it("should throw error when current password is incorrect", async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser)
            jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false))

            await expect(
                service.changePassword(mockUser.id, "wrongpassword", "newpassword")
            ).rejects.toThrow("Senha atual incorreta")
        })
    })
})
