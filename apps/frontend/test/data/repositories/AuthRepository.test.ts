import { AuthRepository } from "@data/repositories/AuthRepository"

describe("AuthRepository", () => {
    let authRepository: AuthRepository
    const mockApiDataSource = {
        post: jest.fn(),
        patch: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        authRepository = new AuthRepository(mockApiDataSource as any)
    })

    it("should login successfully", async () => {
        const mockLoginResponse = {
            data: {
                accessToken: "mock_token",
                refreshToken: "mock_refresh",
                user: {
                    id: 1,
                    email: "admin@ts-cms.local"
                }
            }
        }

        mockApiDataSource.post.mockResolvedValueOnce(mockLoginResponse)

        const result = await authRepository.login(
            "admin@ts-cms.local",
            "admin123"
        )

        expect(result).toHaveProperty("accessToken")
        expect(result).toHaveProperty("user")
    })

    it("should refresh token successfully", async () => {
        const mockRefreshResponse = {
            data: {
                accessToken: "new_token",
                refreshToken: "new_refresh"
            }
        }

        mockApiDataSource.post.mockResolvedValueOnce(mockRefreshResponse)

        const result = await authRepository.refreshToken("old_refresh_token")

        expect(result).toHaveProperty("accessToken")
        expect(result).toHaveProperty("refreshToken")
    })

    it("should handle login error", async () => {
        const mockError = new Error("Invalid credentials")
        mockApiDataSource.post.mockRejectedValueOnce(mockError)

        await expect(
            authRepository.login("wrong@email.com", "wrongpass")
        ).rejects.toThrow()
    })
})
